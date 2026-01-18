const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Job title is required'],
        trim: true 
    },
    company: { 
        type: String, 
        required: [true, 'Company name is required'],
        trim: true 
    },
    // Added logo for a premium UI feel
    companyLogo: {
        type: String,
        default: 'https://via.placeholder.com/150?text=Company+Logo'
    },
    category: { 
        type: String, 
        required: true,
        // Syncing with Course categories
        enum: ['Development', 'Design', 'Marketing', 'Writing', 'Management', 'Other'],
        index: true 
    },
    jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
        default: 'Full-time'
    },
    location: { 
        type: String, 
        default: 'Remote' 
    },
    salary: {
        type: String, 
        default: 'Negotiable'
    },
    description: {
        type: String,
        required: true
    },
    // CRITICAL SYNC: Matches User.skills and Course.skillTag
    requiredSkills: {
        type: [String],
        lowercase: true,
        default: [],
        index: true
    },
    link: { 
        type: String,
        validate: {
            validator: (v) => !v || /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(v),
            message: 'Please provide a valid URL'
        }
    },
    deadline: { 
        type: Date, 
        required: true 
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    // NEW SYNC FEATURE: Track who applied from the Talent-BD platform
    applicants: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        appliedAt: { type: Date, default: Date.now }
    }],
    // NEW SYNC FEATURE: Recommended Course to get this job
    suggestedCourse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});

// VIRTUAL: Check if the job is expired
jobSchema.virtual('isExpired').get(function() {
    return this.deadline ? Date.now() > this.deadline : false;
});

// VIRTUAL: Days remaining until deadline
jobSchema.virtual('daysRemaining').get(function() {
    if (!this.deadline) return 0;
    const diff = new Date(this.deadline) - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

// VIRTUAL: Applicant count for the "Exceptional" UI dashboard
jobSchema.virtual('applicantCount').get(function() {
    return this.applicants ? this.applicants.length : 0;
});

module.exports = mongoose.model('Job', jobSchema);