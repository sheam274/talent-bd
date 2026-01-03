const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Course title is required'],
        trim: true 
    },
    category: { 
        type: String, 
        required: true,
        // Removed strict enum to prevent "Invalid Category" errors from Admin Panel
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
    videoUrl: { 
        type: String, 
        required: [true, 'Video URL is required'],
        // Validates that it is a YouTube link
        validate: {
            validator: function(v) {
                return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+$/.test(v);
            },
            message: props => `${props.value} is not a valid video URL!`
        }
    },
    description: { 
        type: String, 
        maxLength: [1000, 'Description cannot exceed 1000 characters'] 
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
            validate: [v => v.length >= 2, 'Quiz must have at least 2 options'] 
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

// PRE-SAVE HOOK: Fix YouTube links for the iframe player automatically
CourseSchema.pre('save', function(next) {
    if (this.videoUrl.includes('youtube.com/watch?v=')) {
        this.videoUrl = this.videoUrl.replace('watch?v=', 'embed/');
    } else if (this.videoUrl.includes('youtu.be/')) {
        // Handle short links: youtu.be/VIDEO_ID -> youtube.com/embed/VIDEO_ID
        const videoId = this.videoUrl.split('/').pop();
        this.videoUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    next();
});

module.exports = mongoose.model('Course', CourseSchema);