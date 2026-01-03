const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * POST: Save or Update Digital CV
 * Synchronizes CV data with the Global User Profile for Job Matching
 */
router.post('/save', async (req, res) => {
    try {
        const { userId, cvData } = req.body;

        if (!userId || !cvData) {
            return res.status(400).json({ error: "User ID and CV Content are required" });
        }

        // 1. Fetch current user to preserve verified skills
        const currentUser = await User.findById(userId);
        if (!currentUser) return res.status(404).json({ error: "User not found" });

        // 2. Skill Synchronization Logic
        // We take the verified skills (from Learning Hub) and 
        // combine them with the manual skills from the CV Builder
        const manualSkills = cvData.manualSkills ? cvData.manualSkills.map(s => s.name.toLowerCase()) : [];
        const verifiedSkills = currentUser.skills || [];
        
        // Use a Set to ensure we have a unique list of all skills for the Job Marketplace
        const combinedSkills = [...new Set([...verifiedSkills, ...manualSkills])];

        // 3. Update User Profile
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                $set: { 
                    savedCV: {
                        ...cvData,
                        email: cvData.email || currentUser.email, // Fallback to account email
                        name: cvData.name || currentUser.name
                    },
                    // Update the global skills array so the Jobs page can match them
                    skills: combinedSkills 
                } 
            },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({ 
            success: true, 
            message: "CV and Professional Profile synchronized",
            user: updatedUser 
        });

    } catch (err) {
        console.error("CV Sync Error:", err);
        res.status(500).json({ error: "Failed to synchronize CV with profile" });
    }
});

/**
 * GET: Fetch User CV
 */
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('savedCV name email skills');
        if (!user || !user.savedCV) {
            return res.status(404).json({ error: "No CV found for this user" });
        }
        
        res.json({
            ...user.savedCV,
            verifiedSkills: user.skills // Pass these so the CV can show "Verified" badges
        });
    } catch (err) {
        res.status(500).json({ error: "Error fetching CV data" });
    }
});

module.exports = router;