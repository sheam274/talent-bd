const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Course title is required'],
        trim: true 
    },
    // Added instructor to know who to pay when course is sold
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: { 
        type: String, 
        required: true,
        default: 'Development'
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
        default: 0 // 0 for free courses
    },
    videoUrl: { 
        type: String, 
        required: [true, 'Video URL is required'],
        validate: {
            validator: function(v) {
                // Expanded regex to catch all common video formats
                return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+$/.test(v);
            },
            message: props => `${props.value} is not a valid video URL!`
        }
    },
    thumbnail: {
        type: String,
        default: 'https://via.placeholder.com/300x200?text=Course+Thumbnail'
    },
    description: { 
        type: String, 
        required: [true, 'Description is required'],
        maxLength: [2000, 'Description cannot exceed 2000 characters'] 
    },
    rewardXP: {
        type: Number,
        default: 100 
    },
    rewardWallet: {
        type: Number,
        default: 50 
    },
    quiz: [{
        question: { type: String, required: true },
        options: { 
            type: [String], 
            validate: {
                validator: (v) => v.length >= 2,
                message: 'Quiz must have at least 2 options'
            }
        },
        correctAnswer: { 
            type: Number, 
            required: true,
            min: 0
        }
    }],
    verifiedUsers: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }]
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});

// VIRTUAL: Get student count
CourseSchema.virtual('studentCount').get(function() {
    return this.verifiedUsers ? this.verifiedUsers.length : 0;
});

// PRE-SAVE HOOK: Robust YouTube Embed Logic
CourseSchema.pre('save', function(next) {
    if (this.isModified('videoUrl')) {
        let url = this.videoUrl;
        
        // Handle standard youtube.com/watch?v=...
        if (url.includes('youtube.com/watch?v=')) {
            const videoId = url.split('v=')[1].split('&')[0];
            this.videoUrl = `https://www.youtube.com/embed/${videoId}`;
        } 
        // Handle short youtu.be/...
        else if (url.includes('youtu.be/')) {
            const videoId = url.split('/').pop().split('?')[0];
            this.videoUrl = `https://www.youtube.com/embed/${videoId}`;
        }
        // Handle Vimeo
        else if (url.includes('vimeo.com/')) {
            const videoId = url.split('/').pop();
            this.videoUrl = `https://player.vimeo.com/video/${videoId}`;
        }
    }
    next();
});

module.exports = mongoose.model('Course', CourseSchema);