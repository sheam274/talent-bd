const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    category: { type: String, required: true },
    deadline: { type: Date, required: true }, // Added for professional functionality
    link: String,
    location: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);