const express = require('express');
const router = express.Router();
const { Course, Category } = require('../models'); // SYNC: Accessing unified models

// --- 1. CORE STATUS (Preserved) ---
router.get('/status', (req, res) => {
    res.json({ message: "Course route active", timestamp: new Date() });
});

// --- 2. ADMIN CATEGORY MANAGEMENT (New Sync Feature) ---

// GET: Fetch categories for Sidebar/Dropdowns
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
        const { name, group } = req.body; 
        if (!name || !group) return res.status(400).json({ error: "Name and group required" });

        const newCat = new Category({ name, group });
        await newCat.save();
        res.status(201).json({ success: true, category: newCat });
    } catch (err) {
        res.status(400).json({ error: "Category already exists or sync failed" });
    }
});

// DELETE: Admin removes a category
router.delete('/admin/categories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Category deleted from platform" });
    } catch (err) {
        res.status(400).json({ error: "Delete failed" });
    }
});

// --- 3. COURSE SEARCH & FILTERING (Responsive Logic) ---

router.get('/', async (req, res) => {
    try {
        const { category, search, difficulty } = req.query;
        let query = {};

        // SYNC: Dynamic Category filtering
        if (category) query.category = category;
        
        // SYNC: Search functionality
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const courses = await Course.find(query)
            .populate('instructor', 'name') // Shows who made the course
            .sort({ createdAt: -1 });

        res.json({ success: true, count: courses.length, courses });
    } catch (err) {
        res.status(500).json({ error: "Error fetching courses" });
    }
});

module.exports = router;