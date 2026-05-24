const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/jobs
 * @desc    Fetch official live jobs with advanced filtering & smart fallback
 */
router.get('/', async (req, res) => {
    try {
        const { category, search, location, isLive, isRemote, page = 1, limit = 15 } = req.query;
        
        const now = new Date();
        now.setHours(0, 0, 0, 0); 

        // 1. CONSTRUCT BASE QUERY
        let query = { 
            isActive: true 
        };

        // Filter for active deadlines only if requested
        if (isLive === 'true') {
            query.isLive = true;
            query.deadline = { $gte: now };
        }

        const criteria = [];

        // Remote Filtering Logic
        if (isRemote === 'true') {
            criteria.push({
                $or: [
                    { isRemote: true },
                    { location: { $regex: /remote|worldwide|anywhere/i } }
                ]
            });
        }

        // Location Regex Filter
        if (location && !['undefined', '', 'null'].includes(location)) {
            criteria.push({ location: { $regex: location.trim(), $options: 'i' } });
        }

        // Smart Global Search (Title, Company, Tags)
        if (search && search.trim() !== '' && search !== 'undefined') {
            const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedSearch, 'i');
            criteria.push({
                $or: [
                    { title: regex },
                    { company: regex },
                    { tags: { $in: [regex] } },
                    { description: regex }
                ]
            });
        }

        // Category Filter (Flexible Regex match for Industry Sectors)
        if (category && !['All Sectors', 'All', 'undefined', '', 'null'].includes(category)) {
            criteria.push({ category: { $regex: `^${category.trim()}$`, $options: 'i' } });
        }

        // Combine criteria into query using $and
        if (criteria.length > 0) {
            query.$and = criteria;
        }

        // 2. DATA EXECUTION
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, parseInt(limit));
        
        let [jobs, total] = await Promise.all([
            Job.find(query)
                .sort({ isFeatured: -1, createdAt: -1 }) // Featured jobs first, then newest
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .populate('categoryRef') 
                .lean(),
            Job.countDocuments(query)
        ]);

        // 3. SMART FALLBACK
        // If no results found, provide "Recommended Jobs" instead of a blank page
        if (jobs.length === 0) {
            const suggestions = await Job.find({ 
                isActive: true, 
                deadline: { $gte: now } 
            })
                .sort({ createdAt: -1 })
                .limit(4)
                .lean();
            
            return res.json({
                success: true,
                isSuggested: suggestions.length > 0,
                message: "No specific matches found. Here are some fresh openings.",
                jobs: suggestions,
                meta: { total: suggestions.length, page: 1, totalPages: 1 }
            });
        }

        res.json({
            success: true,
            meta: { 
                total, 
                page: pageNum, 
                totalPages: Math.ceil(total / limitNum) 
            },
            jobs 
        });

    } catch (err) {
        console.error("❌ Job Fetch Error:", err);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
} );

/**
 * @route   POST /api/jobs/create
 * @desc    Admin only: Deploy a new job vacancy
 */
router.post('/create', verifyToken, isAdmin, async (req, res) => {
    try {
        const jobData = req.body;
        
        // Data Normalization for the 2026 Engine
        if (jobData.jobType) jobData.jobType = jobData.jobType.toLowerCase().trim();

        const newJob = new Job({
            ...jobData,
            isActive: true // Default to active on creation
        });

        const savedJob = await newJob.save();
        
        res.status(201).json({
            success: true,
            message: "🚀 Vacancy deployed to TalentBD board successfully.",
            job: savedJob
        });
    } catch (err) {
        console.error("❌ Job Creation Error:", err);
        res.status(400).json({ 
            success: false, 
            message: err.message || "Validation failed. Please check all required fields." 
        });
    }
});

module.exports = router;