const express = require('express');
const router = express.Router();
router.get('/health', (req, res) => res.json({ status: "Synced", temp: "44°C Safe" }));
module.exports = router;
