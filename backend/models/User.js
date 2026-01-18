const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    // --- Authentication & Identity ---
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    
    // --- Gamification & Wallet (Integrated with Dashboard) ---
    points: { type: Number, default: 0 },         
    walletBalance: { type: Number, default: 0 },   
    
    // --- SYNCED DATA: Verified Skills & Activity ---
    // These update automatically when a Course is finished
    skills: { type: [String], default: [], index: true }, 
    purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],

    // --- Bookmarks & Applications (Relation to Job Model) ---
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    appliedJobs: [{
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
        appliedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['Pending', 'Reviewed', 'Accepted', 'Rejected'], default: 'Pending' }
    }],

    // --- The Professional CV Builder Data (Strictly Maintained) ---
    savedCV: {
        name: { type: String },
        email: { type: String },
        phone: { type: String },
        summary: { type: String },
        profileImage: { type: String, default: 'https://via.placeholder.com/150?text=Profile' }, 
        LinkedIn: { type: String },
        nationality: { type: String },
        dob: { type: String },
        maritalStatus: { type: String },
        
        manualSkills: [{ 
            name: String, 
            level: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'] } 
        }],
        
        experience: [{ 
            company: String, 
            role: String, 
            period: String, 
            achievements: String,
            location: String,
            website: String
        }],
        
        projects: [{ 
            title: String, 
            link: String, 
            desc: String 
        }],
        
        education: [{ 
            degree: String, 
            institute: String, 
            year: String, 
            result: String 
        }],
        
        references: [{ 
            name: String, 
            company: String, 
            phone: String 
        }]
    },
    
    // Updated Role to support the Marketplace pivot
    role: { type: String, enum: ['user', 'instructor', 'admin'], default: 'user' }
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});

// FIXED: Middleware to hash password before saving (Fixes Login Failures)
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

// VIRTUAL: Calculate Level based on XP (Responsive to points updates)
UserSchema.virtual('level').get(function() {
    return Math.floor(this.points / 1000) + 1;
});

// VIRTUAL: Profile Completion Percentage (For the "Exceptional" UI)
UserSchema.virtual('profileComplete').get(function() {
    let score = 0;
    if (this.savedCV.summary) score += 20;
    if (this.savedCV.profileImage) score += 20;
    if (this.savedCV.experience.length > 0) score += 30;
    if (this.savedCV.education.length > 0) score += 30;
    return score;
});

module.exports = mongoose.model('User', UserSchema);