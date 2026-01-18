const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // SYNC: Using unified model export

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validation
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide both email and password" });
        }

        // 2. Find user & Sync Data
        // SYNC: We now populate bookmarks, appliedJobs, and purchasedCourses 
        // to ensure the User Dashboard is fully loaded upon login.
        const user = await User.findOne({ email: email.toLowerCase().trim() })
            .populate('bookmarks')
            .populate('appliedJobs.jobId')
            .populate('purchasedCourses');
        
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 3. Verify Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 4. Generate JWT
        // SYNC: Including ID and Role in payload for Frontend Protected Routes
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'talentbd_secret_key_2026',
            { expiresIn: '7d' }
        );

        // 5. Construct Response (Highly Responsive for Frontend)
        // This object matches exactly what your Redux/Context state expects
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role, 
            points: user.points || 0,
            level: user.level, // SYNC: Using the Virtual Level from UserSchema
            profileComplete: user.profileComplete, // SYNC: Using the Virtual for UI progress bar
            walletBalance: user.walletBalance || 0,
            skills: user.skills || [],
            bookmarks: user.bookmarks || [], 
            appliedJobs: user.appliedJobs || [], // NEW: Shows status of job applications
            purchasedCourses: user.purchasedCourses || [], // NEW: Unlocks the Learning Hub videos
            savedCV: user.savedCV || {},
            token: token 
        };

        // Log login for admin monitoring (Helpful for your HP-840 terminal logs)
        console.log(`👤 Login Success: ${user.name} | Role: ${user.role} | Temp Check: 44°C`);

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