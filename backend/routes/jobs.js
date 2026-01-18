const express = require('express');
const router = express.Router();
const { Job, Course, User } = require('../models'); // SYNC: Access all models

/**
 * @route   POST /api/jobs/add
 * @desc    Post a new job (Admin/Instructor Only)
 */
router.post('/add', async (req, res) => {
    try {
        const { 
            title, company, category, deadline, link, description,
            location, salary, jobType, requiredSkills, role,
            companyLogo, suggestedCourse // SYNC: Added new fields for premium UI
        } = req.body;

        // FIXED: Role validation (Now supports the expanded 'instructor' role)
        if (role !== 'admin' && role !== 'instructor') {
            return res.status(403).json({ message: "Access denied. Admins or Instructors only." });
        }

        if (!title || !company || !deadline || !description) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newJob = new Job({
            title,
            company,
            companyLogo: companyLogo || '',
            category: category || 'Other',
            deadline,
            link,
            description,
            location: location || 'Remote',
            salary: salary || 'Negotiable',
            jobType: jobType || 'Full-time',
            suggestedCourse: suggestedCourse || null, // SYNC: Link a course to this job
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
 * @desc    Fetch jobs with dynamic filtering, Matching logic, and Course recommendations
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

        // 2. Only show non-expired jobs (Sync with Virtuals)
        filters.deadline = { $gte: new Date() };

        // SYNC: Populate suggested courses so frontend can show "Learn these skills"
        const jobs = await Job.find(filters)
            .populate('suggestedCourse', 'title thumbnail price')
            .sort({ isFeatured: -1, createdAt: -1 });
        
        // 3. Smart Skill-Match & Gap Analysis
        let processedJobs = jobs;
        if (userSkills) {
            const skillsArray = userSkills.split(',').map(s => s.toLowerCase().trim());
            
            processedJobs = await Promise.all(jobs.map(async (job) => {
                const jobObj = job.toObject();
                
                // Calculate Matching and Missing Skills
                const matches = job.requiredSkills.filter(s => skillsArray.includes(s));
                const missing = job.requiredSkills.filter(s => !skillsArray.includes(s));
                
                jobObj.matchPercentage = job.requiredSkills.length > 0 
                    ? Math.round((matches.length / job.requiredSkills.length) * 100) 
                    : 100;
                
                jobObj.missingSkills = missing;

                // SYNC: If skills are missing, find a Course in Talent-BD that teaches them
                if (missing.length > 0 && !jobObj.suggestedCourse) {
                    jobObj.upsellCourse = await Course.findOne({ 
                        skillTag: { $in: missing } 
                    }).select('title price thumbnail');
                }

                return jobObj;
            }));
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

/**
 * @route   POST /api/jobs/apply/:id
 * @desc    Apply for a job (Sync with User and Job model)
 */
router.post('/apply/:id', async (req, res) => {
    try {
        const { userId } = req.body;
        const jobId = req.params.id;

        // SYNC: Update the Job model applicants list
        await Job.findByIdAndUpdate(jobId, {
            $addToSet: { applicants: { user: userId } }
        });

        // SYNC: Update the User model appliedJobs list
        await User.findByIdAndUpdate(userId, {
            $addToSet: { appliedJobs: { jobId: jobId } }
        });

        res.json({ success: true, message: "Application submitted successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Application failed" });
    }
});

module.exports = router;