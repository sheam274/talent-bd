const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const Category = require('../models/Category');

/**
 * 🛡️ MIDDLEWARE: JWT & ROLE VERIFICATION
 * Protects administrative routes from unauthorized access.
 */
const verifyAdmin = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(403).json({ success: false, message: "Access Denied: No Token Provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'talentbd_secret_key_2026');
        
        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Access Denied: Admins Only" });
        }

        req.adminId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Session Expired. Please login again." });
    }
};

/**
 * 🔑 LOGIN ROUTE
 * Handles authentication and initial data synchronization.
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password required" });
        }

        // 1. Fetch user and explicitly select hidden password field
        const user = await User.findOne({ email: email.toLowerCase().trim() })
            .select('+password') 
            .populate('bookmarks')
            .populate('appliedJobs.jobId')
            .populate('purchasedCourses');
        
        // 2. Verification Guard
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // 3. Fetch Platform Taxonomy for Frontend Sync
        const platformCategories = await Category.find({ isActive: true }).sort({ priority: -1 });

        // 4. Generate Session Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'talentbd_secret_key_2026',
            { expiresIn: '7d' }
        );

        // 5. Cleanse User Object (Security)
        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({
            success: true,
            user: { 
                ...userObj, 
                token
            },
            categories: platformCategories 
        });

    } catch (err) {
        console.error("🔥 Login Error:", err);
        res.status(500).json({ success: false, error: "Server Internal Sync Error" });
    }
});

/**
 * 📂 ADMIN: CATEGORY MANAGEMENT
 */

// Create Category
router.post('/admin/categories', verifyAdmin, async (req, res) => {
    try {
        const { name, group, icon, priority, color } = req.body;
        if (!name || !group) {
            return res.status(400).json({ success: false, message: "Name and group required" });
        }

        const newCat = await Category.create({ 
            name: name.trim(), 
            group: group.toLowerCase(),
            icon: icon || 'Briefcase',
            priority: priority || 0,
            color: color || '#2563eb',
            isActive: true
        });
        
        res.status(201).json({ success: true, category: newCat });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message || "Category creation failed" });
    }
});

// Delete Category
router.delete('/admin/categories/:id', verifyAdmin, async (req, res) => {
    try {
        const deleted = await Category.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        res.json({ success: true, message: "Category removed from platform" });
    } catch (err) {
        res.status(500).json({ success: false, error: "Delete operation failed" });
    }
});

module.exports = router;