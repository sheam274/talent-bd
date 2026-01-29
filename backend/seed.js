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
        // Added standard connection options for stability
        await mongoose.connect(connString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ TALENTBD ENGINE: Connected to MongoDB Atlas");

        // --- 1. CLEANUP ---
        await Job.deleteMany({}); 
        console.log("🧹 Database Cleaned: Existing jobs removed.");

        for (const jobData of seedJobs) {
            // 2. CATEGORY SYNC
            // Case-insensitive search for the category
            let categoryDoc = await Category.findOne({ 
                name: { $regex: new RegExp(`^${jobData.category}$`, 'i') },
                group: 'job'
            });

            // If category doesn't exist, create it so the dropdown works!
            if (!categoryDoc) {
                console.log(`📁 AUTO-GENERATING CATEGORY: ${jobData.category}`);
                categoryDoc = await Category.create({ 
                    name: jobData.category, 
                    group: 'job',
                    isActive: true,
                    priority: 5,
                    icon: jobData.category.toLowerCase().includes('software') ? 'Code' : 'Briefcase',
                    color: '#2563eb'
                });
            }

            // 3. REMOTE LOGIC
            const locationLower = jobData.location.toLowerCase();
            const remoteLogic = 
                jobData.isRemote || 
                locationLower.includes('remote') || 
                locationLower.includes('worldwide');

            // 4. SAVE JOB WITH REFERENCE
            const newJob = new Job({
                ...jobData,
                category: categoryDoc.name, // String name for easy UI display
                categoryRef: categoryDoc._id, // MongoDB ID for powerful filtering
                isRemote: remoteLogic,
                isActive: true
            });

            await newJob.save();
            console.log(`🚀 DEPLOYED: ${jobData.title} @ ${jobData.company}`);
        }

        console.log("\n🏁 SEEDING COMPLETE: Your TalentBD 2026 Environment is ready.");
        process.exit(0);
    } catch (err) {
        console.error("❌ SEEDER CRASHED:", err.message);
        process.exit(1);
    }
}

runSeeder();