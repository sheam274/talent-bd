const express = require('express');
const router = express.Router();
const { User } = require('../models'); // SYNC: Access the unified User model

/**
 * POST: Save or Update Digital CV
 * Synchronizes CV data with Global User Profile for Job Matching
 */
router.post('/save', async (req, res) => {
    try {
        const { userId, cvData } = req.body;

        if (!userId || !cvData) {
            return res.status(400).json({ error: "User ID and CV Content are required" });
        }

        // 1. Fetch current user to preserve verified skills and check role
        const currentUser = await User.findById(userId);
        if (!currentUser) return res.status(404).json({ error: "User not found" });

        // 2. Skill Synchronization Logic (Marketplace Ready)
        // Combine Verified (Courses), Manual (CV), and Detected (ATS Scanner) skills
        const manualSkills = cvData.manualSkills ? cvData.manualSkills.map(s => s.name.toLowerCase().trim()) : [];
        const existingSkills = currentUser.skills || [];
        
        // UNIQUE SYNC: Merging all skill sources for the "Exceptional" matching engine
        const combinedSkills = [...new Set([...existingSkills, ...manualSkills])];

        // 3. Update User Profile
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                $set: { 
                    savedCV: {
                        ...cvData,
                        email: cvData.email || currentUser.email,
                        name: cvData.name || currentUser.name,
                        profileImage: cvData.profileImage || currentUser.savedCV.profileImage
                    },
                    skills: combinedSkills 
                } 
            },
            { new: true, runValidators: true }
        ).select('-password')
         .populate('bookmarks')
         .populate('purchasedCourses');

        // 4. RESPONSE LOGIC: Include Profile Strength
        // The frontend uses this to show the "Success" toast with the completion %
        res.json({ 
            success: true, 
            message: "Professional Profile and CV Synced Successfully",
            profileStrength: updatedUser.profileComplete, // SYNC: Virtual from UserSchema
            user: updatedUser 
        });

        console.log(`📝 CV Updated for: ${updatedUser.name} | Strength: ${updatedUser.profileComplete}%`);

    } catch (err) {
        console.error("CV Sync Error:", err);
        res.status(500).json({ error: "Failed to synchronize CV with profile", details: err.message });
    }
});

/**
 * GET: Fetch User CV (Enhanced for Marketplace Visibility)
 */
router.get('/:userId', async (req, res) => {
    try {
        // SYNC: We include points and level so the CV can show "Gamified" badges
        const user = await User.findById(req.params.userId)
            .select('savedCV name email skills points level role');
            
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        // Response optimized for the "CV View" page and "Employer View"
        res.json({
            ...user.savedCV,
            userId: user._id,
            accountEmail: user.email,
            globalSkills: user.skills,
            talentRank: user.points > 5000 ? "Elite" : "Pro", // Fun Market label
            level: user.level,
            role: user.role
        });
    } catch (err) {
        res.status(500).json({ error: "Error fetching CV data" });
    }
});

module.exports = router;