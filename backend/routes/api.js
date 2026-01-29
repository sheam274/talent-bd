const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Job = require('../models/Job');
const Course = require('../models/Course');

/**
 * 🔒 SECURITY ENFORCEMENT
 * verifyAdmin ensures that only authorized personnel can modify 
 * the platform's industry taxonomy.
 */
const { verifyAdmin } = require('../middleware/auth'); 

// --- 1. CORE SYSTEM HEALTH ---
router.get('/health', (req, res) => {
    res.json({ 
        status: "TalentBD API Active", 
        timestamp: new Date(),
        version: "2.0.26",
        engine: "MERN-Node-Edge"
    });
});

// --- 2. CATEGORY & SECTOR MANAGEMENT ---

/**
 * @route   GET /api/categories
 * @desc    PUBLIC: Fetch sectors for the Industry Hub sidebars
 */
router.get('/categories', async (req, res) => {
    try {
        const { group, activeOnly } = req.query; 
        
        // Default filter: only show active categories to the public
        let filter = { isActive: true };
        
        if (group) {
            filter.group = group.toLowerCase();
        }
        
        // Admins might want to see inactive ones via a query param
        if (activeOnly === 'false') delete filter.isActive;

        // Sort: Priority (Higher first) then Alphabetical
        const categories = await Category.find(filter).sort({ priority: -1, name: 1 });
        
        res.json({ 
            success: true, 
            count: categories.length,
            categories 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: "Taxonomy sync failed" });
    }
});

/**
 * @route   POST /api/admin/categories
 * @desc    ADMIN ONLY: Create a new Industry or Learning sector
 */
router.post('/admin/categories', verifyAdmin, async (req, res) => {
    try {
        const { name, group, icon, color, priority } = req.body;
        
        if (!name || !group) {
            return res.status(400).json({ error: "Name and group are required for deployment" });
        }

        // The Category model handles slug generation and smart-theming automatically
        const newCategory = await Category.create({ 
            name: name.trim(), 
            group: group.toLowerCase(),
            icon,
            color,
            priority
        });
        
        res.status(201).json({ success: true, category: newCategory });
    } catch (err) {
        const message = err.code === 11000 ? "This sector already exists in this group" : "Database write failure";
        res.status(400).json({ success: false, error: message });
    }
});

/**
 * @route   DELETE /api/admin/categories/:id
 * @desc    ADMIN ONLY: Permanently remove a sector
 */
router.delete('/admin/categories/:id', verifyAdmin, async (req, res) => {
    try {
        const deleted = await Category.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Category not found in registry" });
        
        res.json({ 
            success: true, 
            message: `Sector '${deleted.name}' has been purged from the platform` 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: "System failed to process deletion" });
    }
});

// --- 3. UNIFIED DATA FEEDS ---

/**
 * @route   GET /api/jobs
 * @desc    Fetch jobs with populated Category themes for the UI
 */
router.get('/jobs', async (req, res) => {
    try {
        const { categorySlug, limit = 20 } = req.query;
        let query = { isActive: true };

        // 1. Filtering by Sector Slug (SEO Friendly)
        if (categorySlug) {
            const foundCategory = await Category.findOne({ slug: categorySlug });
            if (foundCategory) {
                query.category = foundCategory._id;
            }
        }

        // 2. Fetch and Populate Category Details (Icons, Colors)
        const jobs = await Job.find(query)
            .populate('category', 'name icon color slug') 
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({ 
            success: true, 
            count: jobs.length,
            jobs 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: "Job stream synchronization interrupted" });
    }
});

/**
 * @route   GET /api/dashboard-stats
 * @desc    ADMIN: Unified platform analytics
 */
router.get('/admin/stats', verifyAdmin, async (req, res) => {
    try {
        const [jobs, courses, categories] = await Promise.all([
            Job.countDocuments(),
            Course.countDocuments(),
            Category.countDocuments()
        ]);

        res.json({
            success: true,
            data: { jobs, courses, categories }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: "Analytics engine failure" });
    }
});

module.exports = router;