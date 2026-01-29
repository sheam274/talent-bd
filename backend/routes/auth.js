const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Ensure correct model paths
const Category = require('../models/Category');

// --- 🛡️ MIDDLEWARE: JWT & ROLE VERIFICATION ---
const verifyAdmin = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(403).json({ message: "Access Denied: No Token Provided" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'talentbd_secret_key_2026');
        
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: "Access Denied: Admins Only" });
        }

        req.adminId = decoded.id;
        next();
    } catch (err) {
        res.status(401).json({ message: "Session Expired. Please login again." });
    }
};

// --- LOGIN ROUTE (FIXED) ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email and password required" });

        // FIX 1: Explicitly select '+password' because we set select: false in the Schema
        const user = await User.findOne({ email: email.toLowerCase().trim() })
            .select('+password') 
            .populate('bookmarks')
            .populate('appliedJobs.jobId')
            .populate('purchasedCourses');
        
        // FIX 2: Added safety check for 'user' before checking password
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Now bcrypt has a valid string to compare against
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const platformCategories = await Category.find({ isActive: { $ne: false } });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'talentbd_secret_key_2026',
            { expiresIn: '7d' }
        );

        // Remove password from the object before sending to frontend
        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({
            success: true,
            user: { 
                ...userObj, 
                token
            },
            // FIX 3: Sending categories at the top level for easier frontend consumption
            categories: platformCategories 
        });

    } catch (err) {
        console.error("🔥 Login Error:", err);
        res.status(500).json({ error: "Server Internal Sync Error" });
    }
});

// --- ADMIN CATEGORY MANAGEMENT (SECURED) ---

router.post('/admin/categories', verifyAdmin, async (req, res) => {
    try {
        const { name, group, icon, priority } = req.body;
        if (!name || !group) return res.status(400).json({ message: "Name and group required" });

        const newCat = await Category.create({ 
            name: name.trim(), 
            group: group.toLowerCase(),
            icon: icon || '📁',
            priority: priority || 0,
            isActive: true
        });
        
        res.status(201).json({ success: true, category: newCat });
    } catch (err) {
        res.status(400).json({ error: "Category sync failed" });
    }
});

router.delete('/admin/categories/:id', verifyAdmin, async (req, res) => {
    try {
        // Soft delete or Hard delete based on your preference
        await Category.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Category removed from platform" });
    } catch (err) {
        res.status(500).json({ error: "Delete operation failed" });
    }
});

module.exports = router;