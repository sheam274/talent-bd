const express = require('express');
const router = express.Router();

// TalentBD 2026 - CV Architect API
router.get('/test', (req, res) => {
    res.json({ status: "CV Engine Online" });
});

// Route for saving CV data to MongoDB
router.post('/save', async (req, res) => {
    try {
        // Your saving logic will go here
        res.status(201).json({ message: "CV successfully synced to TalentBD profile" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;