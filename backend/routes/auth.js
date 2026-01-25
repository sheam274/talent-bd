const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Category } = require('../models'); // SYNC: Added Category model

// --- LOGIN ROUTE (Preserved & Enhanced) ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide both email and password" });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() })
            .populate('bookmarks')
            .populate('appliedJobs.jobId')
            .populate('purchasedCourses');
        
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // SYNC: Fetch all active categories so the User Dashboard is ready
        const platformCategories = await Category.find({});

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'talentbd_secret_key_2026',
            { expiresIn: '7d' }
        );

        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role, 
            points: user.points || 0,
            level: user.level,
            profileComplete: user.profileComplete,
            walletBalance: user.walletBalance || 0,
            skills: user.skills || [],
            bookmarks: user.bookmarks || [], 
            appliedJobs: user.appliedJobs || [], 
            purchasedCourses: user.purchasedCourses || [], 
            savedCV: user.savedCV || {},
            token: token,
            // NEW SYNC: Categories sent to frontend immediately on login
            categories: platformCategories 
        };

        console.log(`👤 Login Success: ${user.name} | Role: ${user.role}`);

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

// --- NEW FEATURE: ADMIN CATEGORY MANAGEMENT ---

// ADD Category (Admin Only)
router.post('/admin/categories', async (req, res) => {
    try {
        const { name, group } = req.body; // group: 'job' or 'learning'
        if (!name || !group) return res.status(400).json({ message: "Name and group required" });

        const newCat = new Category({ name, group });
        await newCat.save();
        res.status(201).json({ success: true, category: newCat });
    } catch (err) {
        res.status(400).json({ error: "Category already exists or sync failed" });
    }
});

// DELETE Category (Admin Only)
router.delete('/admin/categories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Category deleted across the platform" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete category" });
    }
});

module.exports = router;