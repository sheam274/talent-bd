const express = require('express');
const router = express.Router();
const { Category, Job, Course } = require('../models'); // SYNC: Accessing unified models

// --- 1. CORE HEALTH CHECK (Preserved & Enhanced) ---
router.get('/health', (req, res) => {
    res.json({ 
        status: "Synced", 
        temp: "44°C Safe",
        timestamp: new Date(),
        version: "2.0.26",
        engine: "MERN-Stack-Responsive"
    });
});

// --- 2. ADMIN CATEGORY MANAGEMENT (New Strategic Features) ---

/**
 * @route   POST /api/system/categories
 * @desc    Admin: Add a new category for Jobs or Learning
 */
router.post('/categories', async (req, res) => {
    try {
        const { name, group, icon } = req.body; 
        // group: 'job' or 'learning'
        
        if (!name || !group) {
            return res.status(400).json({ error: "Category name and group (job/learning) are required" });
        }

        const newCategory = new Category({ 
            name: name.trim(), 
            group: group.toLowerCase(),
            icon: icon || '📁'
        });

        await newCategory.save();
        res.status(201).json({ success: true, message: "Category synced to database", newCategory });
    } catch (err) {
        res.status(400).json({ error: "Sync failed: Category might already exist" });
    }
});

/**
 * @route   DELETE /api/system/categories/:id
 * @desc    Admin: Delete a category (Dynamic platform update)
 */
router.delete('/categories/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;
        await Category.findByIdAndDelete(categoryId);
        res.json({ success: true, message: "Category deleted across platform" });
    } catch (err) {
        res.status(500).json({ error: "System failed to delete category" });
    }
});

/**
 * @route   GET /api/system/categories
 * @desc    Public: Fetch categories filtered by group for UI Sidebar
 */
router.get('/categories', async (req, res) => {
    try {
        const { group } = req.query; // e.g., ?group=job
        const filter = group ? { group } : {};
        const categories = await Category.find(filter).sort({ name: 1 });
        res.json({ success: true, count: categories.length, categories });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch platform categories" });
    }
});

// --- 3. SYSTEM ANALYTICS (Sync functionality) ---
router.get('/dashboard-stats', async (req, res) => {
    try {
        const [jobCount, courseCount] = await Promise.all([
            Job.countDocuments(),
            Course.countDocuments()
        ]);
        res.json({ jobs: jobCount, courses: courseCount });
    } catch (err) {
        res.status(500).json({ error: "Stats sync failed" });
    }
});

module.exports = router;