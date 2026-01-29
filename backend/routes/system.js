const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Job = require('../models/Job');
const Course = require('../models/Course');

/**
 * 🛠️ MIDDLEWARE HINT:
 * In a real production environment, you should import your 'protect' and 'admin' 
 * middlewares here to secure the POST and DELETE routes.
 */

// --- 1. CORE HEALTH CHECK ---
router.get('/health', (req, res) => {
    res.json({ 
        status: "Synced", 
        temp: "44°C Safe",
        timestamp: new Date(),
        version: "2.0.26",
        engine: "MERN-Stack-Responsive-v3"
    });
});

// --- 2. CATEGORY ARCHITECTURE ---

/**
 * @route   GET /api/system/categories
 * @desc    Fetch categories (Public). Used for Job Sidebars and Course Filters.
 */
router.get('/categories', async (req, res) => {
    try {
        const { group, isActive } = req.query; 
        
        // Build dynamic filter
        let query = {};
        if (group) query.group = group.toLowerCase();
        if (isActive !== undefined) query.isActive = isActive === 'true';

        // Sort by priority (highest first) then alphabetically
        const categories = await Category.find(query).sort({ priority: -1, name: 1 });
        
        res.json({ 
            success: true, 
            count: categories.length, 
            categories 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "System failed to fetch categories" });
    }
});

/**
 * @route   POST /api/system/categories
 * @desc    Admin: Deploy a new category across the platform.
 */
router.post('/categories', async (req, res) => {
    try {
        const { name, group, icon, color, priority } = req.body; 
        
        // Validation
        if (!name || !group) {
            return res.status(400).json({ 
                success: false, 
                message: "Deployment error: Name and Group (job/learning) are required." 
            });
        }

        const newCategory = new Category({ 
            name: name.trim(), 
            group: group.toLowerCase(),
            icon: icon || 'Briefcase',
            color: color || '#2563eb',
            priority: priority || 0
        });

        await newCategory.save();
        res.status(201).json({ 
            success: true, 
            message: "Global taxonomy entry created successfully.", 
            category: newCategory 
        });
    } catch (err) {
        // Handle duplicate names within the same group
        if (err.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: "Sync failed: This category already exists in this group." 
            });
        }
        res.status(500).json({ success: false, message: "Internal server deployment error." });
    }
});

/**
 * @route   DELETE /api/system/categories/:id
 * @desc    Admin: Remove a category.
 */
router.delete('/categories/:id', async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        
        if (!deletedCategory) {
            return res.status(404).json({ success: false, message: "Category ID not found in system." });
        }

        res.json({ 
            success: true, 
            message: `Category '${deletedCategory.name}' archived and removed from platform.` 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "System failed to process deletion request." });
    }
});

// --- 3. PLATFORM ANALYTICS (HP-840 Optimized) ---

/**
 * @route   GET /api/system/dashboard-stats
 * @desc    Fetch totals for Admin Dashboard
 */
router.get('/dashboard-stats', async (req, res) => {
    try {
        // Parallel counting for speed
        const [jobCount, courseCount, categoryCount] = await Promise.all([
            Job.countDocuments(),
            Course.countDocuments(),
            Category.countDocuments()
        ]);

        res.json({ 
            success: true,
            stats: {
                totalJobs: jobCount,
                totalCourses: courseCount,
                totalCategories: categoryCount
            },
            uptime: process.uptime()
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Stats synchronization engine failed." });
    }
});

module.exports = router;