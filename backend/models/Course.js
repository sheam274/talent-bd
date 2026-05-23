const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Course title is required'],
        trim: true 
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    /**
     * SYNC LOGIC: 
     * We keep 'category' as a String for quick display (Responsive UI),
     * but link it via 'categoryRef' for a hard sync with the Admin's Category Manager.
     */
    category: { 
        type: String, 
        required: true,
        default: 'General',
        index: true
    },
    categoryRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true // Ensures every course is linked to an Admin-created category
    },
    skillTag: { 
        type: String, 
        required: true, 
        lowercase: true, 
        trim: true 
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Expert'],
        default: 'Beginner'
    },
    price: {
        type: Number,
        required: [true, 'Course price is required'],
        min: [0, 'Price cannot be negative'],
        default: 0 
    },
    videoUrl: { 
        type: String, 
        required: [true, 'Video URL is required']
    },
    thumbnail: {
        type: String,
        default: 'https://via.placeholder.com/600x400?text=Course+Preview'
    },
    description: { 
        type: String, 
        required: [true, 'Description is required'],
        maxLength: [2000, 'Description cannot exceed 2000 characters'] 
    },
    isActive: { 
        type: Boolean, 
        default: true, 
        index: true 
    },
    rewardXP: { type: Number, default: 100 },
    rewardWallet: { type: Number, default: 50 },
    quiz: [{
        question: { type: String, required: true },
        options: { type: [String], validate: { validator: (v) => v.length >= 2, message: 'Min 2 options' } },
        correctAnswer: { type: Number, required: true }
    }],
    verifiedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});

// RESPONSIVE SEARCH INDEX
CourseSchema.index({ category: 1, skillTag: 1, title: 'text' });

CourseSchema.virtual('studentCount').get(function() {
    return this.verifiedUsers ? this.verifiedUsers.length : 0;
});

// PRE-SAVE HOOK: Advanced Responsive Video Embed
CourseSchema.pre('save', function(next) {
    if (this.isModified('videoUrl')) {
        let url = this.videoUrl;
        try {
            if (url.includes('youtube.com/watch?v=')) {
                const videoId = url.split('v=')[1].split('&')[0];
                this.videoUrl = `https://www.youtube.com/embed/${videoId}`;
            } else if (url.includes('youtu.be/')) {
                const videoId = url.split('/').pop().split('?')[0];
                this.videoUrl = `https://www.youtube.com/embed/${videoId}`;
            } else if (url.includes('vimeo.com/')) {
                const videoId = url.split('/').pop();
                this.videoUrl = `https://player.vimeo.com/video/${videoId}`;
            }
        } catch (e) {
            console.error("Video URL Sync Error:", e);
        }
    }
    next();
});

module.exports = mongoose.model('Course', CourseSchema);