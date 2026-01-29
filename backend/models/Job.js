const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Job title is required'], trim: true },
    company: { type: String, required: [true, 'Company name is required'], trim: true },
    companyLogo: { type: String, default: 'https://via.placeholder.com/150?text=Company+Logo' },
    
    // Using string for UI and ObjectId for relational integrity
    category: { type: String, required: true, index: true }, 
    categoryRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    
    vacancy: { type: Number, default: 1 },
    experience: { type: String, default: 'At least 1-2 years' },
    
    jobType: {
        type: String,
        // Match exactly what your jobRoutes.js is looking for
        enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
        default: 'full-time',
        lowercase: true,
        trim: true
    },

    location: { type: String, default: 'Worldwide', index: true },
    isRemote: { type: Boolean, default: true, index: true }, 
    salary: { type: String, default: 'Negotiable' },
    description: { type: String, required: true }, 
    
    tags: { type: [String], lowercase: true, default: [], index: true },
    requiredSkills: { type: [String], lowercase: true, default: [], index: true },
    
    link: { type: String, trim: true }, 
    deadline: { type: Date, required: true, index: true },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },

    applicants: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        appliedAt: { type: Date, default: Date.now }
    }]
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});

/**
 * --- 1. DATA NORMALIZATION HOOK ---
 * Fixes data before it hits the DB to ensure filters find it.
 */
jobSchema.pre('validate', function(next) {
    // 1. Force lowercase jobType to match query filters
    if (this.jobType) {
        this.jobType = this.jobType.toLowerCase().replace(' ', '-');
    }

    // 2. Ensure Remote logic is synced
    const loc = (this.location || '').toLowerCase();
    if (loc.includes('remote') || loc.includes('worldwide')) {
        this.isRemote = true;
    }
    
    next();
});

// --- 2. SEARCH ENGINE HOOK ---
jobSchema.pre('save', function(next) {
    const titleWords = this.title ? this.title.toLowerCase().split(/[\s,.-]+/) : [];
    const categoryWords = this.category ? this.category.toLowerCase().split(/[\s,.-]+/) : [];
    const content = `${this.description || ''} ${this.title || ''}`.toLowerCase();
    
    const techStack = [
        'web', 'react', 'node', 'mern', 'frontend', 'backend', 'developer', 
        'javascript', 'python', 'php', 'sql', 'mongodb', 'aws'
    ];
    
    const autoTags = techStack.filter(word => content.includes(word));
    const combined = [...new Set([...this.tags, ...titleWords, ...categoryWords, ...autoTags])];
    
    this.tags = combined.filter(t => t && t.length > 2);
    next();
});

// --- 3. 2026 LIVE VIRTUALS ---
jobSchema.virtual('daysRemaining').get(function() {
    if (!this.deadline) return 0;
    const diff = new Date(this.deadline).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

jobSchema.virtual('isLive').get(function() {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset time for date-only comparison
    return this.isActive && this.deadline && new Date(this.deadline) >= now;
});

// --- 4. TEXT INDEX ---
jobSchema.index({ 
    title: 'text', 
    category: 'text', 
    tags: 'text',
    company: 'text',
    location: 'text'
}, {
    weights: { title: 10, tags: 7, category: 5, location: 3, company: 2 },
    name: "JobSearchIndex"
});

module.exports = mongoose.model('Job', jobSchema);