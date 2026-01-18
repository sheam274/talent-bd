const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Sub-schemas for cleaner structure and validation
const ExperienceSchema = new mongoose.Schema({
    company: String,
    role: String,
    duration: String,
    description: String,
    location: String, // Added for CV completeness
    website: String   // Added for professional look
});

const EducationSchema = new mongoose.Schema({
    institute: String,
    degree: String,
    year: String,
    result: String    // Added for academic detail
});

const userSchema = new mongoose.Schema({
    // --- Identity & Auth ---
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    // SYNC: Added 'instructor' role to support Course/Gig selling
    role: { type: String, enum: ['user', 'instructor', 'admin'], default: 'user' },

    // --- Gamification & Earnings ---
    points: { type: Number, default: 0 },         
    walletBalance: { type: Number, default: 0 },   
    verifiedSkills: [{ type: String, lowercase: true, index: true }], 

    // --- Interaction & Marketplace Sync ---
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    // NEW SYNC: Tracking what the user has bought or where they applied
    purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    appliedJobs: [{
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
        status: { type: String, enum: ['Pending', 'Reviewed', 'Accepted', 'Rejected'], default: 'Pending' },
        appliedAt: { type: Date, default: Date.now }
    }],

    // --- Professional CV Data ---
    savedCV: {
        name: { type: String },
        email: { type: String },
        phone: { type: String },
        summary: { type: String },
        profileImage: { type: String, default: 'https://via.placeholder.com/150?text=User' }, 
        template: { type: String, default: 'modern' },
        LinkedIn: String,      // Added for sync with Job applications
        nationality: String,
        dob: String,
        
        education: [EducationSchema],
        experience: [ExperienceSchema],
        
        skills: [{
            name: { type: String },
            level: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'], default: 'Beginner' }
        }],
        
        projects: [{           // Added to match ATS scanner capabilities
            title: String,
            link: String,
            desc: String
        }]
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// --- FIX 1: PASSWORD HASHING ---
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
userSchema.virtual('level').get(function() {
    return Math.floor((this.points || 0) / 1000) + 1;
});

// --- FIX 3: TOTAL SKILLS HELPER (Master Matcher) ---
userSchema.virtual('allSkills').get(function() {
    const manual = this.savedCV?.skills?.map(s => s.name.toLowerCase()) || [];
    const verified = this.verifiedSkills || [];
    return [...new Set([...manual, ...verified])];
});

// --- FIX 4: PROFILE COMPLETENESS (For Responsive UI) ---
userSchema.virtual('profileStrength').get(function() {
    let score = 0;
    if (this.savedCV?.summary) score += 20;
    if (this.savedCV?.profileImage) score += 10;
    if (this.savedCV?.experience?.length > 0) score += 35;
    if (this.savedCV?.education?.length > 0) score += 35;
    return Math.min(score, 100);
});

module.exports = mongoose.model('User', userSchema);