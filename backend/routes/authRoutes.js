const express = require('express');
const router = express.Router();

// TalentBD 2026 Core Sync
router.get('/', (req, res) => {
    res.json({ status: "Route Active", timestamp: new Date() });
});

module.exports = router;