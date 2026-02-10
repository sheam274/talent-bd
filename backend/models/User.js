const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'], 
        trim: true 
    },
    email: { 
        type: String, 
        unique: true, 
        required: [true, 'Email is required'], 
        lowercase: true, 
        trim: true,
        index: true 
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Hidden by default for security
    },
    
    role: { 
        type: String, 
        enum: ['user', 'instructor', 'admin'], 
        default: 'user',
        index: true 
    },

    // --- RELATIONSHIPS ---
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }], 

    purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    
    appliedJobs: [{
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
        status: { 
            type: String, 
            enum: ['pending', 'reviewed', 'shortlisted', 'rejected'], 
            default: 'pending' 
        },
        appliedAt: { type: Date, default: Date.now }
    }],

    // --- FINTECH & GAMIFICATION (TalentBD Verify-to-Earn) ---
    walletBalance: { type: Number, default: 0, min: [0, 'Balance cannot be negative'] },
    points: { type: Number, default: 0, min: [0, 'Points cannot be negative'] }, 
    
    // --- SKILL VERIFICATION ---
    verifiedSkills: [{
        skillName: { type: String, lowercase: true, trim: true },
        verifiedAt: { type: Date, default: Date.now }
    }],

    lastManagedAction: { type: Date, default: Date.now }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// --- 1. VIRTUALS ---
userSchema.virtual('avatar').get(function() {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=random`;
});

// --- 2. PASSWORD HASHING MIDDLEWARE ---
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// --- 3. FINTECH PROTECTION ---
userSchema.pre('save', function(next) {
    if (this.points < 0) this.points = 0;
    if (this.walletBalance < 0) this.walletBalance = 0;
    next();
});

// --- 4. INSTANCE METHODS ---
userSchema.methods.comparePassword = async function(enteredPassword) {
    // IMPORTANT: Since password has select:false, you must use 
    // .select('+password') in your login controller before calling this.
    return await bcrypt.compare(enteredPassword, this.password);
};

// --- 5. PREVENT MODEL RE-COMPILATION ERROR (Fix for Localhost) ---
module.exports = mongoose.models.User || mongoose.model('User', userSchema);