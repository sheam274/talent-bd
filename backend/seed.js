const mongoose = require('mongoose');
const Job = require('./models/Job'); 
const Category = require('./models/Category'); 
require('dotenv').config();

const seedJobs = [
    {
        title: "Senior MERN Developer",
        company: "TalentBD Tech",
        category: "Software Development", 
        description: "Building the future of 2026 recruitment. Expertise in Node.js, React, and MongoDB required.",
        location: "Dhaka, Bangladesh",
        deadline: new Date('2026-12-31'),
        salary: "80,000 - 120,000 BDT",
        jobType: "full-time", 
        isActive: true,
        isFeatured: true,
        isRemote: false
    },
    {
        title: "Digital Marketing Specialist",
        company: "Growth Agency",
        category: "Marketing", 
        description: "Lead our 2026 growth strategy using AI-driven marketing tools.",
        location: "Worldwide",
        deadline: new Date('2026-11-15'),
        salary: "Negotiable",
        jobType: "contract", 
        isActive: true,
        isFeatured: false,
        isRemote: true
    },
    {
        title: "Lead UI/UX Architect",
        company: "Design Systems Inc",
        category: "Design", 
        description: "Remote opportunity for a design leader to craft high-fidelity React components.",
        location: "Remote",
        deadline: new Date('2026-10-01'),
        salary: "150,000 BDT",
        jobType: "full-time", 
        isActive: true,
        isFeatured: true,
        isRemote: true
    },
    {
        title: "Junior Frontend Engineer",
        company: "Appflow Solutions",
        category: "Software Development",
        description: "Entry-level role focusing on React and Tailwind CSS.",
        location: "Chattogram",
        deadline: new Date('2026-08-20'),
        salary: "45,000 BDT",
        jobType: "full-time",
        isActive: true,
        isFeatured: false,
        isRemote: false
    }
];

async function runSeeder() {
    try {
        const connString = process.env.MONGO_URI || process.env.MONGODB_URI;
        
        if (!connString) {
            throw new Error("MONGO_URI is missing from .env!");
        }

        console.log("⏳ Connecting to TalentBD Cloud...");
        await mongoose.connect(connString);
        console.log("✅ TALENTBD ENGINE: Connected to MongoDB Atlas");

        // --- 1. CLEANUP ---
        // Vital to prevent duplicate key errors if the seeder is run multiple times
        await Job.deleteMany({}); 
        console.log("🧹 Database Cleaned: Fresh start enabled.");

        for (const jobData of seedJobs) {
            // 2. CATEGORY SYNC
            // This ensures every job is mapped to a valid Category object
            let categoryDoc = await Category.findOne({ 
                name: { $regex: new RegExp(`^${jobData.category}$`, 'i') } 
            });

            if (!categoryDoc) {
                console.log(`📁 AUTO-GENERATING CATEGORY: ${jobData.category}`);
                categoryDoc = await Category.create({ 
                    name: jobData.category, 
                    group: 'job',
                    isActive: true,
                    priority: 5,
                    icon: 'Briefcase' 
                });
            }

            // 3. REMOTE LOGIC & DATA NORMALIZATION
            const isRemoteString = jobData.location.toLowerCase();
            const remoteLogic = 
                jobData.isRemote || 
                isRemoteString.includes('remote') || 
                isRemoteString.includes('worldwide');

            // 4. SAVE JOB
            // We use categoryRef for internal DB joins and category name for the UI
            const newJob = new Job({
                ...jobData,
                category: categoryDoc.name,
                categoryRef: categoryDoc._id,
                isRemote: remoteLogic,
                isActive: true
            });

            await newJob.save();
            console.log(`🚀 DEPLOYED: ${jobData.title} @ ${jobData.company}`);
        }

        console.log("\n🏁 SEEDING COMPLETE: Your 2026 Dashboard is now live.");
        process.exit(0);
    } catch (err) {
        console.error("❌ SEEDER CRASHED:", err.message);
        process.exit(1);
    }
}

runSeeder();