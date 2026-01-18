const express = require('express');
const router = express.Router();

// Placeholder for course data sync
router.get('/', (req, res) => {
    res.json({ message: "Course route active" });
});

module.exports = router;