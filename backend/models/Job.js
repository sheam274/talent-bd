const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Job title is required'], trim: true },
    company: { type: String, required: [true, 'Company name is required'], trim: true },
    companyLogo: { 
        type: String, 
        default: 'https://via.placeholder.com/150?text=Company+Logo' 
    },
    
    // UI Label and DB Reference for high-performance filtering
    category: { type: String, required: true, index: true }, 
    categoryRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true },
    
    vacancy: { type: Number, default: 1 },
    experience: { type: String, default: 'At least 1-2 years' },
    
    jobType: {
        type: String,
        enum: {
            values: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
            message: '{VALUE} is not a valid job type'
        },
        default: 'full-time',
        lowercase: true,
        trim: true
    },

    location: { type: String, default: 'Worldwide', index: true },
    isRemote: { type: Boolean, default: true, index: true }, 
    salary: { type: String, default: 'Negotiable' },
    description: { type: String, required: [true, 'Job description is mandatory'] }, 
    
    // Search optimization fields
    tags: { type: [String], lowercase: true, default: [], index: true },
    requiredSkills: { type: [String], lowercase: true, default: [], index: true },
    
    link: { type: String, trim: true }, 
    deadline: { type: Date, required: [true, 'Application deadline is required'], index: true },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    isLive: { type: Boolean, default: true, index: true },

    applicants: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        appliedAt: { type: Date, default: Date.now }
    }]
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});

// --- 1. PRE-VALIDATION: DATA NORMALIZATION ---
jobSchema.pre('validate', function(next) {
    // Standardize JobType format (e.g., "Full Time" -> "full-time")
    if (this.jobType) {
        this.jobType = this.jobType.toLowerCase().trim().replace(/\s+/g, '-');
    }

    // Auto-detect Remote status from location string
    const loc = (this.location || '').toLowerCase();
    if (loc.includes('remote') || loc.includes('worldwide') || loc.includes('anywhere')) {
        this.isRemote = true;
    }
    
    next();
});

// --- 2. PRE-SAVE: SEARCH ENGINE TAGGING ---
jobSchema.pre('save', function(next) {
    const titleWords = this.title ? this.title.toLowerCase().split(/[\s,.-]+/) : [];
    const categoryWords = this.category ? this.category.toLowerCase().split(/[\s,.-]+/) : [];
    const content = `${this.description || ''} ${this.title || ''}`.toLowerCase();
    
    // 2026 Tech Keyword Extractor
    const techStack = [
        'web', 'react', 'node', 'mern', 'frontend', 'backend', 'developer', 
        'javascript', 'python', 'php', 'sql', 'mongodb', 'aws', 'docker', 'ui', 'ux'
    ];
    
    const autoTags = techStack.filter(word => content.includes(word));
    
    // Merge user tags, title words, category, and tech stack into one unique array
    const combined = [...new Set([...(this.tags || []), ...titleWords, ...categoryWords, ...autoTags])];
    
    // Filter out short/useless words
    this.tags = combined.filter(t => t && t.length > 2);
    next();
});

// --- 3. DYNAMIC VIRTUALS ---
// Returns number of days until the job expires
jobSchema.virtual('daysRemaining').get(function() {
    if (!this.deadline) return 0;
    const diff = new Date(this.deadline).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

// --- 4. PERFORMANCE TEXT INDEX ---
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