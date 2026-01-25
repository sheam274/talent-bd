const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * USER SCHEMA: Central Auth & Fintech Hub
 * Linked with Category Sync for Admin management.
 */
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { 
        type: String, 
        unique: true, 
        required: true, 
        lowercase: true, 
        trim: true 
    },
    password: { type: String, required: true },
    
    // --- ROLE & PERMISSIONS ---
    role: { 
        type: String, 
        enum: ['user', 'instructor', 'admin'], 
        default: 'user' 
    },

    // --- WALLET & REWARDS ---
    walletBalance: { type: Number, default: 0 },
    points: { type: Number, default: 0 }, // XP Rewards
    
    // --- SKILLS & PROGRESS ---
    verifiedSkills: [{
        skillName: String,
        verifiedAt: { type: Date, default: Date.now }
    }],
    purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

    // --- ADMIN SYNC: DYNAMIC CONTROL ---
    /**
     * Instead of hardcoded strings, Admin-managed users can now
     * reference the global Category collection.
     */
    lastManagedAction: { type: Date, default: Date.now }
}, { 
    timestamps: true 
});

// PASSWORD HASHING: Responsive Security
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// FINTECH PROTECTION: Ensure values never drop below zero
userSchema.pre('save', function(next) {
    if (this.points < 0) this.points = 0;
    if (this.walletBalance < 0) this.walletBalance = 0;
    next();
});

module.exports = mongoose.model('User', userSchema);