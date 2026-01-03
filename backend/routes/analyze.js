const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');

// Configure Multer for PDF only
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed'), false);
    }
});

// Middleware for handling Multer errors specifically
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
        
        // Ensure jobDescription exists or use a default if coming from a general scan
        const jobDescription = req.body.jobDescription || "";
        
        // Extract Text from PDF
        const data = await pdf(req.file.buffer);
        const resumeText = data.text.toLowerCase();
        const jdText = jobDescription.toLowerCase();

        // 1. Unified Skill Library (Synced with Course & Job Tags)
        const skillLibrary = [
            'react', 'node', 'mongodb', 'javascript', 'python', 'sql', 'express', 
            'aws', 'docker', 'typescript', 'figma', 'tailwind', 'nextjs', 
            'flutter', 'marketing', 'seo', 'design', 'management', 'ui/ux'
        ];

        // 2. Exact Word Matching Logic (Using Word Boundaries)
        const findSkills = (text) => {
            if (!text) return [];
            return skillLibrary.filter(skill => {
                // \b ensures we match "sql" but not "mysql" or "sqli"
                const regex = new RegExp(`\\b${skill}\\b`, 'i');
                return regex.test(text);
            });
        };

        const resumeSkills = [...new Set(findSkills(resumeText))]; // Set removes duplicates
        const jdSkills = [...new Set(findSkills(jdText))];

        // 3. Compare JD vs Resume
        const matchingSkills = resumeSkills.filter(s => jdSkills.includes(s));
        const missingSkills = jdSkills.filter(s => !resumeSkills.includes(s));

        // 4. Weighted Scoring Algorithm
        const totalRequired = jdSkills.length;
        let score = 0;
        
        if (totalRequired === 0) {
            // If scanning without a specific JD, score is based on total skill count
            score = Math.min(100, resumeSkills.length * 15); 
        } else {
            score = Math.round((matchingSkills.length / totalRequired) * 100);
        }

        // 5. Determine "Talent Rank"
        let rank = "Bronze";
        if (score > 85) rank = "Platinum";
        else if (score > 65) rank = "Gold";
        else if (score > 40) rank = "Silver";

        // Return Analysis
        res.json({ 
            success: true,
            score, 
            rank,
            matchingSkills, 
            missingSkills,
            detectedSkills: resumeSkills,
            textLength: resumeText.length,
            analysisDate: new Date().toISOString()
        });

    } catch (err) { 
        console.error("Scanner Error:", err);
        res.status(500).json({ 
            error: "Analysis failed", 
            details: "Ensure the PDF is text-based and not a scanned image." 
        }); 
    }
});

module.exports = router;