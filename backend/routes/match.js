const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

/**
 * POST /api/jobs/match-jobs
 * Intelligent Matching: Compares User Verified Badges vs Job Required Skills
 */
router.post('/match-jobs', async (req, res) => {
    try {
        const { userSkills } = req.body; // Array of strings: ['react', 'node']
        
        if (!userSkills || !Array.isArray(userSkills)) {
            return res.status(400).json({ error: "Invalid skills data. Expected an array." });
        }

        // 1. Normalize user skills for reliable comparison
        const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());

        // 2. Fetch active jobs (Non-expired)
        const activeJobs = await Job.find({ deadline: { $gte: new Date() } });
        
        // 3. Intelligent Comparison Logic
        const matches = activeJobs.map(job => {
            // Convert Mongoose doc to plain object to allow adding virtual properties
            const jobData = job.toObject();
            const required = jobData.requiredSkills || [];
            
            if (required.length === 0) {
                return { ...jobData, matchScore: 0, matchedSkills: [], relevance: "None" };
            }

            // Find intersection of User Skills and Job Requirements
            const matchedSkills = required.filter(skill => 
                normalizedUserSkills.includes(skill.toLowerCase().trim())
            );

            // Calculation: (Matches / Required)
            const matchPercentage = Math.round((matchedSkills.length / required.length) * 100);
            
            // 4. Determine Relevance Category for Frontend Badges
            let relevance = "Low";
            if (matchPercentage >= 80) relevance = "High";
            else if (matchPercentage >= 50) relevance = "Medium";

            return {
                ...jobData,
                matchScore: matchPercentage,
                relevance,
                matchedSkills,
                // Helpful for the UI: "You need to learn [X] to apply for this job"
                missingSkills: required.filter(s => !matchedSkills.includes(s.toLowerCase()))
            };
        })
        // 5. Filter & Sort: Only show jobs with at least 1 match, highest score first
        .filter(job => job.matchScore > 0) 
        .sort((a, b) => b.matchScore - a.matchScore); 

        res.json({
            success: true,
            count: matches.length,
            matches
        });
    } catch (err) {
        console.error("❌ Intelligence Engine Error:", err);
        res.status(500).json({ error: "Server failed to calculate job matches" });
    }
});

module.exports = router;