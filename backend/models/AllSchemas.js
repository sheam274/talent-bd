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
    points: { type: Number, default: 0 },         
    walletBalance: { type: Number, default: 0 },   
    skills: { type: [String], default: [] },                             
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    savedCV: {
        name: String,
        profileImage: String,
        bio: String,
        experience: String
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

// FIXED: Middleware to hash password before saving to DB
UserSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
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

// --- 3. COURSE SCHEMA ---
const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    skillTag: { type: String, required: true },      
    videoUrl: { type: String, required: true },
    description: String,
    rewardAmount: { type: Number, default: 50 },     
    quiz: [{
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: Number, required: true } 
    }],
    verifiedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

// FIXED: Defining models before exporting
const User = mongoose.model('User', UserSchema);
const Job = mongoose.model('Job', JobSchema);
const Course = mongoose.model('Course', CourseSchema);

// Exporting so they can be accessed as require('./models').User
module.exports = { User, Job, Course };