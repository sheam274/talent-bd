const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Category = require('../models/Category');
const Course = require('../models/Course'); 

/**
 * 1. DASHBOARD ANALYTICS
 * Provides a high-level overview of the ecosystem's health.
 */
router.get('/stats', async (req, res) => {
    try {
        // Parallel execution for maximum performance (2026 Engine Standard)
        const [courseCount, jobCount, catCount] = await Promise.all([
            Course.countDocuments({ isActive: true }),
            Job.countDocuments({ isActive: true }),
            Category.countDocuments({ isActive: true })
        ]);

        res.json({ 
            success: true, 
            stats: {
                totalCourses: courseCount,
                totalJobs: jobCount,
                totalCategories: catCount
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: "Analytics sync failed" });
    }
});

/**
 * 2. CATEGORY MANAGEMENT
 * Handles the creation and retrieval of taxonomy tags.
 */
router.get('/categories', async (req, res) => {
    try {
        const { group } = req.query; 
        let filter = { isActive: true };
        
        if (group && group !== 'all') {
            filter.group = group.toLowerCase().trim();
        }

        const categories = await Category.find(filter).sort({ priority: -1, name: 1 });
        res.json({ success: true, categories });
    } catch (err) {
        res.status(500).json({ success: false, error: "Category fetch failed" });
    }
});

router.post('/categories', async (req, res) => {
    try {
        // Enforce uniqueness within the group
        const existing = await Category.findOne({ 
            name: req.body.name, 
            group: req.body.group 
        });
        
        if (existing) {
            return res.status(400).json({ success: false, error: "Category already exists in this group" });
        }

        const category = await Category.create({ 
            ...req.body,
            isActive: true 
        });
        res.status(201).json({ success: true, category });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message || "Validation failed" });
    }
});

/**
 * 3. JOB DEPLOYMENT
 * Converts form data into indexed job records with category references.
 */
router.post('/jobs', async (req, res) => {
    try {
        const { location, category } = req.body;

        // Auto-detect Remote/Worldwide status
        const isRemoteJob = 
            req.body.isRemote || 
            /remote|worldwide|anywhere/i.test(location);

        // Map Category Name to ID for relational integrity
        const categoryDoc = await Category.findOne({ name: category, group: 'job' });

        const jobData = {
            ...req.body,
            location: location || 'Worldwide',
            isRemote: isRemoteJob,
            categoryRef: categoryDoc ? categoryDoc._id : null,
            isActive: true,
            // Default 30-day deadline if none provided
            deadline: req.body.deadline ? new Date(req.body.deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };

        const job = await Job.create(jobData);
        res.status(201).json({ 
            success: true, 
            message: isRemoteJob ? "🚀 Global Remote Job Deployed!" : "✅ Local Job Posted",
            job 
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

/**
 * 4. COURSE ARCHITECT
 * Deploys new video modules with attached quiz logic.
 */
router.post('/courses', async (req, res) => {
    try {
        const categoryDoc = await Category.findOne({ name: req.body.category, group: 'learning' });
        
        const course = await Course.create({ 
            ...req.body, 
            categoryRef: categoryDoc ? categoryDoc._id : null,
            isActive: true 
        });
        res.status(201).json({ success: true, course });
    } catch (err) {
        res.status(400).json({ success: false, error: "Course deployment failed" });
    }
});

/**
 * 5. UNIVERSAL ARCHIVE SYSTEM (Soft Delete)
 * Uses a dynamic parameter to archive Jobs, Courses, or Categories.
 */
router.delete('/archive/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        const Models = { job: Job, course: Course, category: Category };
        const TargetModel = Models[type.toLowerCase()];
        
        if (!TargetModel) {
            return res.status(404).json({ success: false, error: "Invalid entity type" });
        }

        // Soft delete: Update isActive to false instead of deleting record
        const updated = await TargetModel.findByIdAndUpdate(
            id, 
            { isActive: false }, 
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, error: "Document not found" });
        }
        
        res.json({ 
            success: true, 
            message: `${type.toUpperCase()} archived successfully.` 
        });
    } catch (err) {
        res.status(400).json({ success: false, error: "Archive operation failed" });
    }
});

module.exports = router;