const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

router.post('/match-jobs', async (req, res) => {
    try {
        const { userSkills } = req.body; // Array of skills from user CV
        const allJobs = await Job.find();
        
        const matches = allJobs.map(job => {
            const jobDesc = job.description.toLowerCase();
            const matchedSkills = userSkills.filter(skill => jobDesc.includes(skill.toLowerCase()));
            const matchPercentage = Math.round((matchedSkills.length / userSkills.length) * 100);
            
            return {
                ...job._doc,
                matchScore: matchPercentage,
                matchedSkills
            };
        }).sort((a, b) => b.matchScore - a.matchScore); // Highest match first

        res.json(matches);
    } catch (err) {
        res.status(500).json({ error: "Matching failed" });
    }
});

module.exports = router;