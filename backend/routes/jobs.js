const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

/**
 * @route   POST /api/jobs/add
 * @desc    Post a new job (Admin Only)
 */
router.post('/add', async (req, res) => {
    try {
        const { 
            title, company, category, deadline, link, description,
            location, salary, jobType, requiredSkills, role 
        } = req.body;

        // FIXED: Check role from user object (passed from frontend state)
        if (role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        if (!title || !company || !deadline || !description) {
            return res.status(400).json({ message: "Missing required fields: Title, Company, Deadline, or Description" });
        }

        const newJob = new Job({
            title,
            company,
            category: category || 'Other',
            deadline,
            link,
            description,
            location: location || 'Remote',
            salary: salary || 'Negotiable',
            jobType: jobType || 'Full-time',
            // Normalize skills for the matching system
            requiredSkills: Array.isArray(requiredSkills) 
                ? requiredSkills.map(s => s.toLowerCase().trim()) 
                : []
        });

        const savedJob = await newJob.save();
        res.status(201).json({
            success: true,
            message: "Job circular published successfully",
            job: savedJob
        });
    } catch (err) {
        console.error("Job Post Error:", err);
        res.status(500).json({ message: "Server error while posting job" });
    }
});

/**
 * @route   GET /api/jobs
 * @desc    Fetch jobs with dynamic filtering and Matching logic
 */
router.get('/', async (req, res) => {
    try {
        const { category, location, search, userSkills } = req.query;
        let filters = {};

        // 1. Dynamic Filtering
        if (category && category !== 'All') filters.category = category;
        if (location) filters.location = new RegExp(location, 'i');
        if (search) {
            filters.$or = [
                { title: new RegExp(search, 'i') },
                { company: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
            ];
        }

        // 2. Only show non-expired jobs
        filters.deadline = { $gte: new Date() };

        const jobs = await Job.find(filters).sort({ isFeatured: -1, createdAt: -1 });
        
        // 3. Optional Skill-Match Logic
        // If the frontend sends the user's skills, we calculate the match percentage
        let processedJobs = jobs;
        if (userSkills) {
            const skillsArray = userSkills.split(',').map(s => s.toLowerCase());
            processedJobs = jobs.map(job => {
                const jobObj = job.toObject();
                const matches = job.requiredSkills.filter(s => skillsArray.includes(s));
                jobObj.matchPercentage = job.requiredSkills.length > 0 
                    ? Math.round((matches.length / job.requiredSkills.length) * 100) 
                    : 100;
                return jobObj;
            });
        }

        res.json({
            count: processedJobs.length,
            jobs: processedJobs
        });
    } catch (err) {
        console.error("Fetch Jobs Error:", err);
        res.status(500).json({ message: "Error fetching job marketplace" });
    }
});

module.exports = router;