const express = require('express');
const router = express.Router();
const { Job, Course, Category } = require('../models'); 
const { verifyAdmin } = require('./auth'); // Essential for security

// --- 1. CORE STATUS ---
router.get('/health', (req, res) => {
    res.json({ 
        status: "TalentBD API Active", 
        timestamp: new Date(),
        version: "2.0.26" 
    });
});

// --- 2. CATEGORY MANAGEMENT ---

// PUBLIC: Fetch all categories (Used by Search, Profile, and Signup)
router.get('/categories', async (req, res) => {
    try {
        const { group } = req.query; 
        const filter = group ? { group: group.toLowerCase() } : {};
        // Only show active categories to the public
        filter.isActive = { $ne: false }; 

        const categories = await Category.find(filter).sort({ name: 1 });
        res.json({ success: true, categories });
    } catch (err) {
        res.status(500).json({ success: false, error: "Failed to fetch categories" });
    }
});

// ADMIN ONLY: Add category
router.post('/admin/categories', verifyAdmin, async (req, res) => {
    try {
        const { name, group, icon } = req.body;
        if (!name || !group) return res.status(400).json({ error: "Name and group required" });

        const newCategory = await Category.create({ 
            name: name.trim(), 
            group: group.toLowerCase(),
            icon: icon || '📁' 
        });
        
        res.status(201).json({ success: true, category: newCategory });
    } catch (err) {
        res.status(400).json({ error: "Category sync error (likely duplicate name)" });
    }
});

// ADMIN ONLY: Delete (Soft Delete recommended, but this is a Hard Delete)
router.delete('/admin/categories/:id', verifyAdmin, async (req, res) => {
    try {
        const deleted = await Category.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Category not found" });
        res.json({ success: true, message: "Category removed from ecosystem" });
    } catch (err) {
        res.status(400).json({ error: "Delete operation failed" });
    }
});

// --- 3. UNIFIED DATA FETCHING ---



// GET Jobs with Category Filtering
router.get('/jobs', async (req, res) => {
    try {
        const { category } = req.query;
        // Search by category ID or Name depending on your Frontend setup
        const query = category ? { category, isActive: true } : { isActive: true };
        const jobs = await Job.find(query).populate('category').sort({ createdAt: -1 });
        res.json({ success: true, data: jobs });
    } catch (err) {
        res.status(500).json({ error: "Job fetch failed" });
    }
});

module.exports = router;