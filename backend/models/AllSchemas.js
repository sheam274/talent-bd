const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// --- 1. USER SCHEMA ---
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true 
    },
    password: { type: String, required: true },
    points: { type: Number, default: 0 },         // rewardXP goes here
    walletBalance: { type: Number, default: 0 },   // rewardWallet goes here
    skills: { type: [String], default: [] },                             
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    // Added for Course/Gig history
    purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    savedCV: {
        name: String,
        profileImage: String,
        bio: String,
        experience: String
    },
    // Expanded roles for Marketplace (Instructor can sell courses/gigs)
    role: { 
        type: String, 
        enum: ['user', 'instructor', 'admin'], 
        default: 'user' 
    },
    createdAt: { type: Date, default: Date.now }
});

// FIXED: Added 'next' and 'this.isModified' check to prevent unnecessary hashing
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// --- 2. JOB SCHEMA ---
const JobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: 'Remote' },
    salary: { type: String, default: 'Negotiable' }, 
    description: { type: String, required: true },
    category: { type: String, required: true },      
    tags: [String],                                  
    postedAt: { type: Date, default: Date.now }
});

// --- 3. COURSE SCHEMA (Fixed & Enhanced) ---
const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, default: 'General' },
    skillTag: { type: String, required: true, lowercase: true },      
    videoUrl: { type: String, required: true },
    price: { type: Number, default: 0 }, // Added for selling
    description: String,
    rewardXP: { type: Number, default: 100 },     
    rewardWallet: { type: Number, default: 50 },     
    quiz: [{
        question: { type: String, required: true },
        options: { 
            type: [String], 
            validate: [v => v.length >= 2, 'Minimum 2 options required'] 
        },
        correctAnswer: { type: Number, required: true } 
    }],
    verifiedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// FIXED: YouTube/Vimeo Embed Logic (Added from previous step)
CourseSchema.pre('save', function(next) {
    if (this.isModified('videoUrl')) {
        if (this.videoUrl.includes('youtube.com/watch?v=')) {
            const videoId = this.videoUrl.split('v=')[1].split('&')[0];
            this.videoUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (this.videoUrl.includes('youtu.be/')) {
            const videoId = this.videoUrl.split('/').pop().split('?')[0];
            this.videoUrl = `https://www.youtube.com/embed/${videoId}`;
        }
    }
    next();
});

// --- MODELS ---
const User = mongoose.model('User', UserSchema);
const Job = mongoose.model('Job', JobSchema);
const Course = mongoose.model('Course', CourseSchema);

module.exports = { User, Job, Course };