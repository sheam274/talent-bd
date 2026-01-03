const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: String,
    company: String,
    location: String,
    description: String,
    category: String,
    postedAt: { type: Date, default: Date.now }
});

const CourseSchema = new mongoose.Schema({
    title: String,
    skillTag: String,
    videoUrl: String,
    description: String,
    quiz: [{
        question: String,
        options: [String],
        correctAnswer: Number
    }],
    verifiedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = {
    Job: mongoose.model('Job', JobSchema),
    Course: mongoose.model('Course', CourseSchema)
};