const express = require('express');
const router = express.Router();
const { Course, User } = require('../models'); // SYNC: Access both models for cross-referencing

/**
 * GET: Retrieve all courses with Advanced Filtering
 * Accessible at: GET /api/courses
 */
router.get('/', async (req, res) => {
    try {
        const { category, skill, search, difficulty } = req.query;
        let query = {};
        
        // SYNC: Category Filtering
        if (category) query.category = category;
        
        // SYNC: Skill Filtering (lowercase for model match)
        if (skill) query.skillTag = skill.toLowerCase();

        // NEW: Difficulty Filtering
        if (difficulty) query.difficulty = difficulty;

        // NEW: Search by Title (Responsive Search Bar)
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        // SYNC: Populating instructor name to show on the Course Card UI
        const courses = await Course.find(query)
            .populate('instructor', 'name savedCV.profileImage') 
            .select('-verifiedUsers') 
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: courses.length,
            courses
        });
    } catch (err) {
        console.error("Fetch Courses Error:", err);
        res.status(500).json({ error: "Failed to fetch learning modules" });
    }
});

/**
 * GET: Single Course Details (For the Video Player & Quiz)
 */
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name savedCV.profileImage bio');
            
        if (!course) return res.status(404).json({ error: "Course not found" });
        
        res.json(course);
    } catch (err) {
        res.status(500).json({ error: "Error loading video module" });
    }
});

/**
 * POST: Upload a new course (Admin/Instructor Only logic)
 */
router.post('/upload', async (req, res) => {
    try {
        const { 
            title, 
            skillTag, 
            videoUrl, 
            quiz, 
            category, 
            rewardXP, 
            rewardWallet, 
            difficulty, 
            instructor, // SYNC: Link to the creator
            price,      // NEW: For Marketplace Selling
            thumbnail   // NEW: For Premium UI
        } = req.body;

        // 1. Validation check (SYNC: Now requires instructor ID)
        if (!title || !skillTag || !videoUrl || !instructor) {
            return res.status(400).json({ 
                error: "Incomplete course data. Title, SkillTag, Video URL, and Instructor ID are required." 
            });
        }

        // 2. Create Course with Gamification features
        // Note: YouTube URL conversion is handled by Course.js Pre-save hook
        const newCourse = new Course({
            title: title.trim(),
            instructor,
            category: category || 'Development',
            skillTag: skillTag.toLowerCase().trim(),
            difficulty: difficulty || 'Beginner',
            videoUrl,
            price: Number(price) || 0,
            thumbnail: thumbnail || '',
            description: req.body.description || "",
            rewardXP: Number(rewardXP) || 100,      
            rewardWallet: Number(rewardWallet) || 50, 
            quiz: Array.isArray(quiz) ? quiz : []     
        });

        await newCourse.save();
        
        // SYNC: Log activity (Optional: could also push to User.purchasedCourses if creator)
        console.log(`🎬 [HP-840 Admin] New Course: ${title} published successfully at 44°C.`);

        res.status(201).json({
            success: true,
            message: "New Course and Certification Quiz published!",
            course: newCourse
        });

    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: "Server error during course upload", details: err.message });
    }
});

module.exports = router;