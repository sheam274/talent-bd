const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const Category = require('../models/Category');

// Helper: Generate JWT Token
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET || 'talentbd_secret_key_2026',
        { expiresIn: '7d' }
    );
};

/**
 * 🛡️ MIDDLEWARE: JWT & ROLE VERIFICATION
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
 * 📝 SIGNUP ROUTE
 * Fixed: Explicitly handles user creation and returns token.
 */
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Validation (matches User Model requirements)
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email, and password are required" });
        }

        // 2. Check for existing user
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        // 3. Create new user (Password hashing is handled in User Model middleware)
        const user = await User.create({
            name,
            email: email.toLowerCase().trim(),
            password,
            role: role || 'user'
        });

        // 4. Generate Token
        const token = generateToken(user._id, user.role);

        // 5. Response
        const userObj = user.toObject();
        delete userObj.password;

        res.status(201).json({
            success: true,
            user: { ...userObj, token },
            message: "Account created successfully"
        });

    } catch (err) {
        console.error("🔥 Signup Error:", err);
        res.status(400).json({ success: false, error: err.message || "Registration failed" });
    }
});

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

        // 3. Compare password using the method in User Model
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // 4. Fetch Platform Taxonomy for Frontend Sync
        const platformCategories = await Category.find({ isActive: true }).sort({ priority: -1 });

        // 5. Generate Session Token
        const token = generateToken(user._id, user.role);

        // 6. Cleanse User Object
        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({
            success: true,
            user: { ...userObj, token },
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

module.exports = router;