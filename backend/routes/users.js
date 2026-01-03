const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Sub-schemas for cleaner structure and validation
const ExperienceSchema = new mongoose.Schema({
    company: String,
    role: String,
    duration: String,
    description: String
});

const EducationSchema = new mongoose.Schema({
    institute: String,
    degree: String,
    year: String
});

const userSchema = new mongoose.Schema({
    // --- Identity & Auth ---
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // --- Gamification & Earnings ---
    points: { type: Number, default: 0 },         
    walletBalance: { type: Number, default: 0 },   
    verifiedSkills: [{ type: String, lowercase: true }], // Lowercase for easier matching

    // --- Interaction ---
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

    // --- Professional CV Data ---
    savedCV: {
        name: { type: String },
        email: { type: String },
        phone: { type: String },
        summary: { type: String },
        profileImage: { type: String }, 
        template: { type: String, default: 'modern' },
        
        education: [EducationSchema],
        experience: [ExperienceSchema],
        
        skills: [{
            name: { type: String },
            level: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'], default: 'Beginner' }
        }]
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// --- FIX 1: PASSWORD HASHING ---
// This ensures your Login logic actually works!
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// --- FIX 2: VIRTUAL LEVELING ---
// Calculates level dynamically so you don't have to save it in DB
userSchema.virtual('level').get(function() {
    return Math.floor((this.points || 0) / 1000) + 1;
});

// --- FIX 3: TOTAL SKILLS HELPER ---
// Combines verified and manual skills for a master list
userSchema.virtual('allSkills').get(function() {
    const manual = this.savedCV?.skills?.map(s => s.name.toLowerCase()) || [];
    const verified = this.verifiedSkills || [];
    return [...new Set([...manual, ...verified])];
});

module.exports = mongoose.model('User', userSchema);