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
 * Returns courses with proper categorization for frontend
 */
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = { isActive: true };
        const andConditions = [];

        // Filter by category (matches both 'tag' format from frontend and 'skillTag' in DB)
        if (category && category !== 'All') {
            andConditions.push({
                $or: [
                    { skillTag: category.toLowerCase() },
                    { category: category }
                ]
            });
        }
        
        // Responsive live search on title and description
        if (search) {
            andConditions.push({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            });
        }

        // Combine all conditions with $and if there are any
        if (andConditions.length > 0) {
            query.$and = andConditions;
        }

        const courses = await Course.find(query)
            .populate('categoryRef')
            .sort({ createdAt: -1 })
            .lean();

        // Transform courses to add 'tag' field for frontend compatibility
        const transformedCourses = courses.map(course => ({
            ...course,
            tag: course.skillTag || course.category || 'General',
            video: course.videoUrl, // Frontend expects 'video' field
            duration: course.duration || '15 min'
        }));

        res.json(transformedCourses);
    } catch (err) {
        console.error("❌ Course Fetch Error:", err);
        res.status(500).json({ error: "Course Engine Sync Error" });
    }
});

// POST: Add New Module (Unified with featured content structure)
router.post('/', async (req, res) => {
    try {
        const { title, video, videoUrl, tag, skillTag, description, duration } = req.body;
        
        if (!title || !video && !videoUrl) {
            return res.status(400).json({ error: "Title and Video URL required" });
        }

        // Support both 'video' and 'videoUrl' field names from frontend
        const finalVideoUrl = video || videoUrl;
        const finalTag = tag || skillTag || 'General';

        const newCourse = new Course({
            title,
            videoUrl: finalVideoUrl,
            skillTag: finalTag.toLowerCase().trim(),
            category: finalTag,
            description: description || 'Premium learning module for TalentBD users.',
            duration: duration || '15 min',
            thumbnail: req.body.thumbnail || '',
            instructor: req.body.instructor || null // Will be set by admin
        });

        await newCourse.save();
        res.status(201).json({ success: true, course: newCourse });
    } catch (err) {
        console.error("❌ Course Creation Error:", err);
        res.status(400).json({ error: "Failed to inject new course into engine" });
    }
});

module.exports = router;