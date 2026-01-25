const express = require('express');
const router = express.Router();
const { Job, Course, Category, User } = require('../models'); // SYNC: Unified Model Access

// --- 1. CORE SYSTEM STATUS (Original Feature Preserved) ---
router.get('/', (req, res) => {
    res.json({ 
        status: "TalentBD 2026 System Active", 
        timestamp: new Date(),
        systemTemp: "44°C", // HP-840 Monitoring
        environment: process.env.NODE_ENV || "development"
    });
});

// --- 2. DYNAMIC CATEGORY MANAGEMENT (New Admin Features) ---

/**
 * @route   POST /api/admin/categories
 * @desc    Admin: Add a new category for Jobs or Learning Hub
 */
router.post('/categories', async (req, res) => {
    try {
        const { name, group, icon } = req.body; 
        // group: 'job' (Job Board/Gigs) or 'learning' (Learning Hub/Courses)
        
        if (!name || !group) {
            return res.status(400).json({ error: "Name and Group are required" });
        }

        const newCategory = new Category({ 
            name: name.trim(), 
            group: group.toLowerCase(),
            icon: icon || '📁'
        });

        await newCategory.save();
        res.status(201).json({ success: true, message: "Category added successfully", newCategory });
    } catch (err) {
        res.status(400).json({ error: "Category already exists or invalid data" });
    }
});

/**
 * @route   DELETE /api/admin/categories/:id
 * @desc    Admin: Delete a category (Responsive Sync)
 */
router.delete('/categories/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;
        await Category.findByIdAndDelete(categoryId);
        res.json({ success: true, message: "Category removed from platform" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete category" });
    }
});

/**
 * @route   GET /api/admin/categories
 * @desc    Public/Admin: Fetch categories filtered by group
 */
router.get('/categories', async (req, res) => {
    try {
        const { group } = req.query; // Filter by 'job' or 'learning'
        const filter = group ? { group } : {};
        const categories = await Category.find(filter).sort({ name: 1 });
        res.json({ success: true, count: categories.length, categories });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

// --- 3. GLOBAL SYNC: SYSTEM ANALYTICS ---
router.get('/stats', async (req, res) => {
    try {
        const jobCount = await Job.countDocuments();
        const courseCount = await Course.countDocuments();
        const userCount = await User.countDocuments();
        
        res.json({
            success: true,
            stats: { jobs: jobCount, courses: courseCount, users: userCount }
        });
    } catch (err) {
        res.status(500).json({ error: "Stats sync failed" });
    }
});

module.exports = router;