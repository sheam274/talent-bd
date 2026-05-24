require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('./models/Job');
const Category = require('./models/Category');
const Course = require('./models/Course');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        
        const jobCount = await Job.countDocuments();
        const catCount = await Category.countDocuments();
        const courseCount = await Course.countDocuments();
        
        console.log(`Jobs: ${jobCount}, Categories: ${catCount}, Courses: ${courseCount}`);
        
        if (jobCount > 0) {
            const job = await Job.findOne();
            console.log('Sample Job:', job);
        }
        
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err.message);
        process.exit(1);
    });
