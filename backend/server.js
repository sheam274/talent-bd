const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI);

// --- Models with FORCED collection names ---
const Job = mongoose.model('Job', new mongoose.Schema({
    title: String, company: String, location: String, 
    description: String, category: String, postedAt: { type: Date, default: Date.now }
}), 'jobs'); // Force collection name to 'jobs'

const Course = mongoose.model('Course', new mongoose.Schema({
    title: String, skillTag: String, videoUrl: String, description: String
}), 'courses'); // Force collection name to 'courses'

// --- API ROUTES ---

// GET Jobs
app.get('/api/jobs', async (req, res) => {
    const data = await Job.find().sort({ postedAt: -1 });
    res.json(data);
});

// GET Courses
app.get('/api/courses', async (req, res) => {
    const data = await Course.find();
    res.json(data);
});

// ADMIN POST (Jobs)
app.post('/api/admin/job', async (req, res) => {
    const newJob = new Job(req.body);
    await newJob.save();
    res.json(newJob);
});

// ADMIN POST (Courses)
app.post('/api/admin/course', async (req, res) => {
    let data = req.body;
    // URL Cleaning for YouTube
    if (data.videoUrl && data.videoUrl.includes("watch?v=")) {
        const id = data.videoUrl.split("v=")[1].split("&")[0];
        data.videoUrl = `https://www.youtube.com/embed/${id}`;
    }
    const newCourse = new Course(data);
    await newCourse.save();
    res.json(newCourse);
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));