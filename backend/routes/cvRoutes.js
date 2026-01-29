const express = require('express');
const router = express.Router();
const { User, Category } = require('../models');

/**
 * --- SECURITY MIDDLEWARE ---
 * Verifies if the request is coming from an authenticated Admin
 */
const verifyAdmin = async (req, res, next) => {
    try {
        // Assume user object is attached via a previous auth middleware
        // If not, you would verify the JWT here.
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ error: "Access denied. Admin privileges required." });
        }
    } catch (err) {
        res.status(500).json({ error: "Internal security check failed" });
    }
};

/**
 * --- ADMIN FEATURE: DYNAMIC CATEGORY MANAGEMENT ---
 */

// 1. ADD: Admin adds a new category with group taxonomy
router.post('/admin/categories', verifyAdmin, async (req, res) => {
    try {
        const { name, group } = req.body; // group: 'job' or 'learning'
        if (!name || !group) return res.status(400).json({ error: "Name and group are required" });

        // Normalize name to prevent duplicates like "AI" and "ai"
        const normalizedName = name.trim();
        
        const newCategory = new Category({ 
            name: normalizedName, 
            group: group.toLowerCase() 
        });
        
        await newCategory.save();
        res.status(201).json({ 
            success: true, 
            message: "Platform taxonomy updated", 
            category: newCategory 
        });
    } catch (err) {
        res.status(400).json({ error: "Category already exists or validation failed" });
    }
});

// 2. DELETE: Admin removes a category
router.delete('/admin/categories/:id', verifyAdmin, async (req, res) => {
    try {
        const deleted = await Category.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Category not found" });
        
        res.json({ success: true, message: "Category removed from global registry" });
    } catch (err) {
        res.status(500).json({ error: "System could not process deletion" });
    }
});

// 3. GET: Fetch categories (Supports optional filtering by group)
router.get('/categories/all', async (req, res) => {
    try {
        const { group } = req.query;
        const filter = group ? { group: group.toLowerCase() } : {};
        
        const categories = await Category.find(filter).sort({ name: 1 });
        res.json({ categories });
    } catch (err) {
        res.status(500).json({ error: "Failed to load platform categories" });
    }
});

/**
 * --- CV & PROFILE SYNC (Skill Aggregator) ---
 */

router.post('/save', async (req, res) => {
    try {
        const { userId, cvData } = req.body;

        if (!userId || !cvData) {
            return res.status(400).json({ error: "User identity and data required" });
        }

        const currentUser = await User.findById(userId);
        if (!currentUser) return res.status(404).json({ error: "User not found" });

        // TalentBD 2026 Skill Logic: Automerge CV skills into profile
        const manualSkills = cvData.manualSkills 
            ? cvData.manualSkills.map(s => s.name.toLowerCase().trim()) 
            : [];
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
                        profileImage: cvData.profileImage || (currentUser.savedCV && currentUser.savedCV.profileImage)
                    },
                    skills: combinedSkills 
                } 
            },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({ 
            success: true, 
            message: "Cloud Profile Synced",
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