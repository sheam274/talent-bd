const express = require('express');
const router = express.Router();
const { Job, Course, Category } = require('../models'); // SYNC: Unified Model Access

// --- 1. CORE STATUS (Preserved & Fixed) ---
router.get('/', (req, res) => {
    res.json({ 
        status: "TalentBD API Active", 
        timestamp: new Date(),
        version: "2.0.26" 
    });
});

// --- 2. ADMIN: CATEGORY MANAGEMENT (New Additions) ---

// GET: Fetch all categories (Responsive for Sidebar/Dropdowns)
router.get('/categories', async (req, res) => {
    try {
        const { group } = req.query; // 'job' or 'learning'
        const filter = group ? { group } : {};
        const categories = await Category.find(filter).sort({ name: 1 });
        res.json({ success: true, categories });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

// POST: Admin adds a new category
router.post('/admin/categories', async (req, res) => {
    try {
        const { name, group } = req.body; // e.g., { name: 'AI Engineering', group: 'job' }
        if (!name || !group) return res.status(400).json({ error: "Missing name or group" });

        const newCategory = new Category({ name, group });
        await newCategory.save();
        res.status(201).json({ success: true, message: "Category Added", newCategory });
    } catch (err) {
        res.status(400).json({ error: "Category already exists or invalid data" });
    }
});

// DELETE: Admin removes a category
router.delete('/admin/categories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Category Deleted Successfully" });
    } catch (err) {
        res.status(400).json({ error: "Delete failed" });
    }
});

// --- 3. DATA SYNC ROUTES ---

// Unified Job Fetching (Responsive to Admin Categories)
router.get('/jobs', async (req, res) => {
    const { category } = req.query;
    const query = category ? { category } : {};
    const jobs = await Job.find(query).sort({ createdAt: -1 });
    res.json(jobs);
});

// Unified Course Fetching
router.get('/courses', async (req, res) => {
    const { category } = req.query;
    const query = category ? { category } : {};
    const courses = await Course.find(query).sort({ createdAt: -1 });
    res.json(courses);
});

module.exports = router;