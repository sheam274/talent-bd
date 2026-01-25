const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const { User, Course, Category } = require('../models'); // SYNC: Added Category model

// Configure Multer for PDF only
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed'), false);
    }
});

const uploadMiddleware = (req, res, next) => {
    upload.single('resume')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
};

router.post('/', uploadMiddleware, async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No resume file uploaded" });
        
        const jobDescription = req.body.jobDescription || "";
        const userId = req.body.userId; 

        // Extract Text from PDF
        const data = await pdf(req.file.buffer);
        const resumeText = data.text.toLowerCase();
        const jdText = jobDescription.toLowerCase();

        // 1. DYNAMIC SKILL LIBRARY SYNC
        // We fetch categories created by the Admin to use as secondary skill keywords
        const activeCategories = await Category.find({ group: 'learning' }).select('name');
        const dynamicSkills = activeCategories.map(c => c.name.toLowerCase());

        const skillLibrary = [
            'react', 'node', 'mongodb', 'javascript', 'python', 'sql', 'express', 
            'aws', 'docker', 'typescript', 'figma', 'tailwind', 'nextjs', 
            'flutter', 'marketing', 'seo', 'design', 'management', 'ui/ux',
            ...dynamicSkills // SYNC: Admin-added categories are now searchable skills
        ];

        // 2. Exact Word Matching Logic
        const findSkills = (text) => {
            if (!text) return [];
            return skillLibrary.filter(skill => {
                const regex = new RegExp(`\\b${skill}\\b`, 'i');
                return regex.test(text);
            });
        };

        const resumeSkills = [...new Set(findSkills(resumeText))]; 
        const jdSkills = [...new Set(findSkills(jdText))];

        // 3. Compare JD vs Resume
        const matchingSkills = resumeSkills.filter(s => jdSkills.includes(s));
        const missingSkills = jdSkills.filter(s => !resumeSkills.includes(s));

        // 4. Weighted Scoring Algorithm
        const totalRequired = jdSkills.length;
        let score = 0;
        if (totalRequired === 0) {
            score = Math.min(100, resumeSkills.length * 15); 
        } else {
            score = Math.round((matchingSkills.length / totalRequired) * 100);
        }

        // 5. Determine "Talent Rank"
        let rank = "Bronze";
        if (score > 85) rank = "Platinum";
        else if (score > 65) rank = "Gold";
        else if (score > 40) rank = "Silver";

        // --- UPDATE USER PROFILE ---
        if (userId) {
            await User.findByIdAndUpdate(userId, {
                $addToSet: { skills: { $each: resumeSkills } } 
            });
        }

        // --- SMART COURSE RECOMMENDATIONS (Synced with Missing Skills) ---
        const recommendedCourses = await Course.find({
            $or: [
                { skillTag: { $in: missingSkills } },
                { category: { $in: missingSkills } } // Matches Admin categories
            ]
        }).select('title skillTag difficulty price thumbnail category').limit(3);

        res.json({ 
            success: true,
            score, 
            rank,
            matchingSkills, 
            missingSkills,
            detectedSkills: resumeSkills,
            recommendedCourses, 
            analysisDate: new Date().toISOString()
        });

    } catch (err) { 
        res.status(500).json({ error: "Analysis failed", details: err.message }); 
    }
});

// --- ADMIN FEATURE: DYNAMIC CATEGORY MANAGEMENT ---
// Allowing Admin to Add/Delete categories which directly affects the scanner's library
router.post('/admin/sync-categories', async (req, res) => {
    try {
        const { name, group } = req.body; // group: 'job' or 'learning'
        const newCat = new Category({ name, group });
        await newCat.save();
        res.json({ success: true, message: `Category '${name}' added and synced to ATS library.` });
    } catch (err) {
        res.status(400).json({ error: "Sync failed. Category might already exist." });
    }
});

module.exports = router;