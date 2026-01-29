const express = require('express');
const router = express.Router();
const Course = require('../models/Course'); 
const Category = require('../models/Category');

// --- 1. ENGINE STATUS ---
router.get('/status', (req, res) => {
    res.json({ 
        status: "Learning Engine 2026: Online", 
        sync: true,
        timestamp: new Date() 
    });
});

// --- 2. CATEGORY SYNC (Filterable for Learning Hub) ---
/**
 * GET /api/courses/categories
 * Used by Sidebar and Filter bars to show available learning paths
 */
router.get('/categories', async (req, res) => {
    try {
        const { group } = req.query; 
        // Force lower-case sync for 'learning' vs 'job'
        const filter = group ? { group: group.toLowerCase().trim() } : { group: 'learning' };
        
        const categories = await Category.find(filter).sort({ name: 1 });
        
        // Direct array for immediate React .map() usage
        res.json(categories); 
    } catch (err) {
        res.status(500).json({ error: "Sync failure: Categories unreachable" });
    }
});

// POST: Add new Category (Hardened for Admin)
router.post('/categories', async (req, res) => {
    try {
        const { name, group, icon } = req.body; 
        if (!name || !group) return res.status(400).json({ error: "Sync Error: Name/Group required" });

        const newCat = await Category.create({ 
            name: name.trim(), 
            group: group.toLowerCase().trim(),
            icon: icon || '📚' 
        });
        res.status(201).json({ success: true, category: newCat });
    } catch (err) {
        res.status(400).json({ error: "Duplicate category or DB rejection" });
    }
});

// --- 3. RESPONSIVE COURSE SEARCH & FILTER ---
/**
 * GET /api/courses
 * Handles the main Learning Hub grid with responsive filtering
 */
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = {};

        // Sync: Matches the 'tag' field in your LearningHub.js
        if (category && category !== 'All') {
            query.tag = category; 
        }
        
        // Sync: Responsive live search
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const courses = await Course.find(query).sort({ createdAt: -1 });

        // Sending direct array to maintain Hub responsiveness
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: "Course Engine Sync Error" });
    }
});

// POST: Add New Module (Unified with featured content structure)
router.post('/', async (req, res) => {
    try {
        const { title, video, tag, description, duration } = req.body;
        
        if (!title || !video) return res.status(400).json({ error: "Title and Video URL required" });

        const newCourse = new Course({
            title,
            video,
            tag: tag || 'General',
            description: description || 'Premium learning module for TalentBD users.',
            duration: duration || '15 min',
            thumbnail: req.body.thumbnail || '' // Frontend getYouTubeThumb handles this if empty
        });

        await newCourse.save();
        res.status(201).json({ success: true, course: newCourse });
    } catch (err) {
        res.status(400).json({ error: "Failed to inject new course into engine" });
    }
});

module.exports = router;