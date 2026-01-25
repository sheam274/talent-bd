const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Job title is required'], trim: true },
    company: { type: String, required: [true, 'Company name is required'], trim: true },
    companyLogo: { type: String, default: 'https://via.placeholder.com/150?text=Company+Logo' },
    
    /**
     * DYNAMIC SYNC:
     * We use 'category' (String) for fast frontend filtering and 
     * 'categoryRef' (ObjectId) to link strictly to Admin-managed categories.
     */
    category: { 
        type: String, 
        required: true,
        index: true 
    },
    categoryRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true // Ensures every job belongs to an Admin-approved category
    },
    jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Gig'],
        default: 'Full-time'
    },
    location: { type: String, default: 'Remote' },
    salary: { type: String, default: 'Negotiable' },
    description: { type: String, required: true },
    requiredSkills: { type: [String], lowercase: true, default: [], index: true },
    rewardXP: { type: Number, default: 50 },
    link: { type: String },
    deadline: { type: Date, required: true },
    isFeatured: { type: Boolean, default: false },
    applicants: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        appliedAt: { type: Date, default: Date.now }
    }],
    suggestedCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});

// RESPONSIVE VIRTUALS
jobSchema.virtual('isExpired').get(function() {
    return this.deadline ? Date.now() > this.deadline : false;
});
jobSchema.virtual('daysRemaining').get(function() {
    if (!this.deadline) return 0;
    const diff = new Date(this.deadline) - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});
jobSchema.virtual('applicantCount').get(function() {
    return this.applicants ? this.applicants.length : 0;
});

// Multi-index for HP-840 Responsive Search
jobSchema.index({ category: 1, jobType: 1, title: 'text' });

module.exports = mongoose.model('Job', jobSchema);