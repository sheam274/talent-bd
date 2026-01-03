const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const CVSchema = new mongoose.Schema({
    userId: String,
    content: Object,
    createdAt: { type: Date, default: Date.now }
});

const CV = mongoose.model('CV', CVSchema);

router.post('/save', async (req, res) => {
    try {
        const newCV = new CV(req.body);
        await newCV.save();
        res.json({ success: true, message: "CV Saved to Profile" });
    } catch (err) {
        res.status(500).json({ error: "Failed to save CV" });
    }
});

module.exports = router;