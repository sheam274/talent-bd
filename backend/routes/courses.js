const express = require('express');
const router = express.Router();
const Course = require('../models/Course'); // Ensure this path is correct

/**
 * GET: Retrieve all courses
 * Accessible at: GET /api/courses
 */
router.get('/', async (req, res) => {
    try {
        const { category, skill } = req.query;
        let query = {};
        
        if (category) query.category = category;
        if (skill) query.skillTag = skill.toLowerCase();

        // We include the quiz but exclude verifiedUsers to keep it fast
        // The quiz is needed for the VideoPlayer.js to show questions
        const courses = await Course.find(query)
            .select('-verifiedUsers') 
            .sort({ createdAt: -1 });

        res.json(courses);
    } catch (err) {
        console.error("Fetch Courses Error:", err);
        res.status(500).json({ error: "Failed to fetch learning modules" });
    }
});

/**
 * GET: Single Course Details (For the Video Player)
 * Accessible at: GET /api/courses/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: "Course not found" });
        res.json(course);
    } catch (err) {
        res.status(500).json({ error: "Error loading video module" });
    }
});

/**
 * POST: Upload a new course (Admin Only logic)
 * Accessible at: POST /api/courses/upload
 */
router.post('/upload', async (req, res) => {
    try {
        const { title, skillTag, videoUrl, quiz, category, rewardXP, rewardWallet } = req.body;

        // 1. Validation check (All features preserved)
        if (!title || !skillTag || !videoUrl) {
            return res.status(400).json({ 
                error: "Incomplete course data. Title, SkillTag, and Video URL are required." 
            });
        }

        // 2. Normalize YouTube URL (Crucial for React iframe)
        let formattedUrl = videoUrl;
        if (videoUrl.includes("watch?v=")) {
            const videoId = videoUrl.split("v=")[1].split("&")[0];
            formattedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (videoUrl.includes("youtu.be/")) {
            const videoId = videoUrl.split("/").pop();
            formattedUrl = `https://www.youtube.com/embed/${videoId}`;
        }

        // 3. Create Course with Gamification features
        const newCourse = new Course({
            title,
            category: category || 'Development',
            skillTag: skillTag.toLowerCase().trim(),
            videoUrl: formattedUrl,
            description: req.body.description || "",
            rewardXP: Number(rewardXP) || 100,      // XP for level up
            rewardWallet: Number(rewardWallet) || 50, // Real wallet money
            quiz: Array.isArray(quiz) ? quiz : []     // Certification quiz
        });

        await newCourse.save();
        
        res.status(201).json({
            success: true,
            message: "New Course and Certification Quiz published!",
            course: newCourse
        });

    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: "Server error during course upload" });
    }
});

module.exports = router;