const express = require('express');
const router = express.Router();
const { Job, Category } = require('../models'); // SYNC: Accessing real database models

/**
 * --- 1. CORE JOB FETCHING (Fixed & Enhanced) ---
 * Responsive to Category filtering from the Frontend Sidebar
 */
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};

        // If a category filter is active, apply it
        if (category && category !== 'All') {
            query.category = category;
        }

        const jobs = await Job.find(query).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch jobs from database" });
    }
});

/**
 * --- 2. ADMIN FEATURE: DYNAMIC CATEGORY MANAGEMENT ---
 * Option for admin to add or delete categories for job and learning
 */

// ADD: Admin creates a new category (e.g., "Cybersecurity" for "job")
router.post('/categories/add', async (req, res) => {
    try {
        const { name, group } = req.body; // group should be 'job' or 'learning'
        if (!name || !group) return res.status(400).json({ error: "Name and Group required" });

        const newCategory = new Category({ name, group });
        await newCategory.save();
        
        res.status(201).json({ success: true, message: "Category added successfully", newCategory });
    } catch (err) {
        res.status(400).json({ error: "Category already exists or invalid data" });
    }
});

// DELETE: Admin removes a category
router.delete('/categories/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;
        await Category.findByIdAndDelete(categoryId);
        res.json({ success: true, message: "Category deleted from platform" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete category" });
    }
});

// GET: Fetch categories specifically for the Job Board or Learning Hub
router.get('/categories/list', async (req, res) => {
    try {
        const { group } = req.query; // 'job' or 'learning'
        const filter = group ? { group } : {};
        const categories = await Category.find(filter).sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: "Error fetching category list" });
    }
});

module.exports = router;