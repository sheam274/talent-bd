const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Category = require('../models/Category');
const Course = require('../models/Course'); 

// --- 1. DASHBOARD ANALYTICS (The Heart of the Panel) ---
router.get('/learning-hub', async (req, res) => {
    try {
        // Parallel execution for maximum performance in 2026
        const [courseCount, jobCount, catCount] = await Promise.all([
            Course.countDocuments({ isActive: { $ne: false } }),
            Job.countDocuments({ isActive: { $ne: false } }),
            Category.countDocuments({ isActive: { $ne: false } })
        ]);

        res.json({ 
            success: true, 
            stats: {
                totalCourses: courseCount || 0,
                totalJobs: jobCount || 0,
                totalCategories: catCount || 0
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: "Stats sync failed" });
    }
});

// --- 2. CATEGORY ARCHITECT ---
router.get('/categories', async (req, res) => {
    try {
        const { group } = req.query; 
        let filter = { isActive: { $ne: false } };
        
        // Sanitize group input
        if (group && !['undefined', 'null', ''].includes(String(group))) {
            filter.group = group.toLowerCase().trim();
        }

        const categories = await Category.find(filter).sort({ priority: -1, name: 1 });
        res.json({ success: true, categories: categories || [] });
    } catch (err) {
        res.status(500).json({ success: false, error: "Category fetch failed" });
    }
});

router.post('/categories', async (req, res) => {
    try {
        // Check for duplicates within the same group
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
        res.status(400).json({ success: false, error: "Validation failed" });
    }
});

// --- 3. WORLDWIDE JOB DEPLOYMENT ---
router.post('/jobs', async (req, res) => {
    try {
        const { location, category } = req.body;

        // Logic: Enforce Worldwide/Remote flags for the 2026 Global Board
        const isRemoteJob = 
            req.body.isRemote || 
            location?.toLowerCase().includes('remote') || 
            location?.toLowerCase().includes('worldwide');

        // Logic: Link the job to a Category Object ID for relational integrity
        const categoryDoc = await Category.findOne({ name: category, group: 'job' });

        const jobData = {
            ...req.body,
            location: location || 'Worldwide',
            isRemote: isRemoteJob,
            categoryRef: categoryDoc ? categoryDoc._id : null,
            isActive: true,
            // Default deadline: 30 days from now if not specified
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

// --- 4. COURSE DEPLOYMENT ---
router.post('/courses', async (req, res) => {
    try {
        // Find categoryRef for Courses too
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

// --- 5. UNIVERSAL SOFT-DELETE ARCHIVE ---

router.patch('/archive/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        const Models = { job: Job, course: Course, category: Category };
        const TargetModel = Models[type.toLowerCase()];
        
        if (!TargetModel) return res.status(404).json({ error: "Invalid model type" });

        const updated = await TargetModel.findByIdAndUpdate(
            id, 
            { isActive: false }, 
            { new: true }
        );
        
        res.json({ 
            success: true, 
            message: `${type.toUpperCase()} moved to archives.` 
        });
    } catch (err) {
        res.status(400).json({ error: "Archive operation failed" });
    }
});

module.exports = router;