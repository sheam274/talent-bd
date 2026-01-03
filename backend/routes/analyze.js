// Run: npm install multer pdf-parse
const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "File missing" });
        
        const data = await pdf(req.file.buffer);
        const resumeText = data.text.toLowerCase();
        const jdText = req.body.jobDescription.toLowerCase();

        // Skill list for scanning
        const skills = ['react', 'node', 'mongodb', 'javascript', 'python', 'sql', 'management', 'design'];
        const found = skills.filter(s => resumeText.includes(s));
        const missing = skills.filter(s => jdText.includes(s) && !resumeText.includes(s));

        const score = Math.round((found.length / (found.length + missing.length || 1)) * 100);

        res.json({ score, matchingSkills: found, missingSkills: missing });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;