const express = require('express');
const router = express.Router();

// TalentBD 2026 System Sync
router.get('/', (req, res) => {
    res.json({ status: "Active", timestamp: new Date() });
});

module.exports = router;