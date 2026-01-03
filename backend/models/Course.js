const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true }, // e.g., Development, Design
    skillTag: { type: String, required: true }, // e.g., React, Python (matches CV skills)
    videoUrl: { type: String, required: true }, // Embed URL
    description: String,
    quiz: [{
        question: String,
        options: [String],
        correctAnswer: { type: Number, required: true } // Index of correct option (0, 1, or 2)
    }],
    verifiedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);