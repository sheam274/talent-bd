const express = require('express');
const router = express.Router();
const { User, Category } = require('../models'); // SYNC: Added Category model

/**
 * --- ADMIN FEATURE: DYNAMIC CATEGORY MANAGEMENT ---
 * Allows Admin to add/delete categories for Job Matching & Learning Hub
 */

// 1. ADD: Admin adds a new category (e.g., "Cybersecurity" for "learning")
router.post('/admin/categories', async (req, res) => {
    try {
        const { name, group } = req.body; // group: 'job' or 'learning'
        if (!name || !group) return res.status(400).json({ error: "Name and group are required" });

        const newCategory = new Category({ name, group });
        await newCategory.save();
        res.status(201).json({ success: true, message: "Category synced to system", category: newCategory });
    } catch (err) {
        res.status(400).json({ error: "Category already exists or invalid data" });
    }
});

// 2. DELETE: Admin removes a category
router.delete('/admin/categories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Category removed from platform" });
    } catch (err) {
        res.status(500).json({ error: "Delete operation failed" });
    }
});

// 3. GET: Fetch all active categories (Responsive for CV Dropdowns)
router.get('/categories/all', async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: "Failed to load platform categories" });
    }
});

/**
 * --- CV & PROFILE SYNC (Preserved & Enhanced) ---
 */

router.post('/save', async (req, res) => {
    try {
        const { userId, cvData } = req.body;

        if (!userId || !cvData) {
            return res.status(400).json({ error: "User ID and CV Content are required" });
        }

        const currentUser = await User.findById(userId);
        if (!currentUser) return res.status(404).json({ error: "User not found" });

        const manualSkills = cvData.manualSkills ? cvData.manualSkills.map(s => s.name.toLowerCase().trim()) : [];
        const existingSkills = currentUser.skills || [];
        const combinedSkills = [...new Set([...existingSkills, ...manualSkills])];

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

        res.json({ 
            success: true, 
            message: "Professional Profile and CV Synced Successfully",
            profileStrength: updatedUser.profileComplete,
            user: updatedUser 
        });

    } catch (err) {
        res.status(500).json({ error: "CV Sync failed", details: err.message });
    }
});

router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('savedCV name email skills points level role');
            
        if (!user) return res.status(404).json({ error: "User not found" });
        
        res.json({
            ...user.savedCV,
            userId: user._id,
            accountEmail: user.email,
            globalSkills: user.skills,
            talentRank: user.points > 5000 ? "Elite" : "Pro", 
            level: user.level,
            role: user.role
        });
    } catch (err) {
        res.status(500).json({ error: "Error fetching CV data" });
    }
});

module.exports = router;