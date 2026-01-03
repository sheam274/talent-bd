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
    
    // --- Verified Skills (Populated from Learning Hub) ---
    skills: { type: [String], default: [] }, 

    // --- Bookmarks (Relation to Job Model) ---
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

    // --- The Professional CV Builder Data ---
    savedCV: {
        name: { type: String },
        email: { type: String },
        phone: { type: String },
        summary: { type: String },
        profileImage: { type: String }, 
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
    
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, // FIXED: Necessary for 'level' to show on Frontend
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

// VIRTUAL: Calculate Level based on XP
UserSchema.virtual('level').get(function() {
    return Math.floor(this.points / 1000) + 1;
});

module.exports = mongoose.model('User', UserSchema);