const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validation
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide both email and password" });
        }

        // 2. Find user (Normalized email)
        // We include .select('+password') if you configured your schema to hide it by default
        const user = await User.findOne({ email: email.toLowerCase().trim() }).populate('bookmarks');
        
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 3. Verify Password
        // This works with the bcrypt 'pre-save' hook we added to the User Model
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 4. Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'talentbd_secret_key_2026',
            { expiresIn: '7d' }
        );

        // 5. Construct Response (Synchronized with App.js requirements)
        // We calculate 'level' here as a fallback, though the Schema virtual handles it
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role, // CRITICAL: Unlocks Admin Panel in Navbar
            points: user.points || 0,
            level: Math.floor((user.points || 0) / 1000) + 1,
            walletBalance: user.walletBalance || 0,
            skills: user.skills || [],
            bookmarks: user.bookmarks || [], 
            savedCV: user.savedCV || {},
            token: token 
        };

        // Log login for admin monitoring
        console.log(`👤 User Logged In: ${user.email} (${user.role})`);

        res.status(200).json({
            success: true,
            message: `Welcome back, ${user.name}`,
            user: userResponse
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
});

module.exports = router;