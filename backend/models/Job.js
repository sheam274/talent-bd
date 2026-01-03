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
    category: { 
        type: String, 
        required: true,
        // Syncing categories with Course categories for a unified experience
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
    // CRITICAL SYNC: These strings match User.skills and Course.skillTag
    requiredSkills: {
        type: [String],
        lowercase: true,
        default: []
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
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, // Ensures isExpired shows up on frontend
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

module.exports = mongoose.model('Job', jobSchema);