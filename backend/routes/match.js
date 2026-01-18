const express = require('express');
const router = express.Router();
const { Job, Course } = require('../models'); // SYNC: Access both models

/**
 * POST /api/jobs/match-jobs
 * Intelligent Matching: Compares User Verified Badges vs Job Required Skills
 * Added: Marketplace Upselling & Course Recommendations
 */
router.post('/match-jobs', async (req, res) => {
    try {
        const { userSkills } = req.body; 
        
        if (!userSkills || !Array.isArray(userSkills)) {
            return res.status(400).json({ error: "Invalid skills data. Expected an array." });
        }

        const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());

        // 1. Fetch active jobs (Non-expired) & Sync with Course Recommendations
        const activeJobs = await Job.find({ deadline: { $gte: new Date() } })
            .populate('suggestedCourse', 'title price thumbnail skillTag');
        
        // 2. Intelligent Comparison Logic
        const matches = await Promise.all(activeJobs.map(async (job) => {
            const jobData = job.toObject();
            const required = jobData.requiredSkills || [];
            
            if (required.length === 0) {
                return { ...jobData, matchScore: 0, matchedSkills: [], relevance: "None" };
            }

            const matchedSkills = required.filter(skill => 
                normalizedUserSkills.includes(skill.toLowerCase().trim())
            );

            const matchPercentage = Math.round((matchedSkills.length / required.length) * 100);
            
            let relevance = "Low";
            if (matchPercentage >= 80) relevance = "High";
            else if (matchPercentage >= 50) relevance = "Medium";

            const missingSkills = required.filter(s => 
                !normalizedUserSkills.includes(s.toLowerCase().trim())
            );

            // --- NEW SYNC FEATURE: AUTO-COURSE RECOMMENDATION ---
            // If the user is missing skills, find a Talent-BD course that teaches them
            let recommendation = jobData.suggestedCourse || null;
            if (missingSkills.length > 0 && !recommendation) {
                recommendation = await Course.findOne({ 
                    skillTag: { $in: missingSkills } 
                }).select('title price thumbnail skillTag difficulty');
            }

            return {
                ...jobData,
                matchScore: matchPercentage,
                relevance,
                matchedSkills,
                missingSkills,
                recommendedCourse: recommendation // SYNC: Frontend shows "Unlock this job by taking this course"
            };
        }));

        // 3. Filter & Sort (SYCED with User Dashboard)
        const sortedMatches = matches
            .filter(job => job.matchScore > 0) 
            .sort((a, b) => b.matchScore - a.matchScore); 

        console.log(`🧠 Intelligence Engine: Processed ${sortedMatches.length} matches for User at 44°C.`);

        res.json({
            success: true,
            count: sortedMatches.length,
            matches: sortedMatches
        });
    } catch (err) {
        console.error("❌ Intelligence Engine Error:", err);
        res.status(500).json({ error: "Server failed to calculate job matches" });
    }
});

module.exports = router;