const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// @route   POST /api/jobs/add
// @desc    Post a new job (Admin Only)
router.post('/add', async (req, res) => {
    const { title, company, category, deadline, link, location, adminRole } = req.body;

    // Security check
    if (adminRole !== 'admin') {
        return res.status(403).json({ message: "Unauthorized. Admin access required." });
    }

    try {
        const newJob = new Job({
            title,
            company,
            category,
            deadline, // Stored as a Date string
            link,
            location
        });

        const savedJob = await newJob.save();
        res.status(201).json(savedJob);
    } catch (err) {
        res.status(500).json({ message: "Error posting job circular" });
    }
});

// @route   GET /api/jobs
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 }); // Newest first
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: "Error fetching jobs" });
    }
});

module.exports = router;