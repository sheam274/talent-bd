require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan'); 
const helmet = require('helmet'); 
const http = require('http'); 
const { Server } = require('socket.io'); 

// Models
const Category = require('./models/Category'); 
const Course = require('./models/Course'); 
const Job = require('./models/Job'); // Ensure you have a Job model imported

const app = express();
const server = http.createServer(app); 

/**
 * 1. LIVE JOB & USER ENGINE (WebSockets)
 */
const io = new Server(server, {
    cors: {
        origin: [
            "https://talent-bd-s.vercel.app", 
            "https://talent-bd-13.vercel.app", 
            "http://localhost:3000", 
            "http://localhost:5173",
            "http://192.168.0.106:3000",
            "http://127.0.0.1:3000"
        ],
        methods: ["GET", "POST"]
    }
});

// Pass Socket.io instance to Express so routes can use it via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
    console.log(`⚡ User Connected: ${socket.id}`);

    // Update global user count
    io.emit('user_count_update', io.engine.clientsCount);

    // This listener handles manual triggers from the client
    socket.on('new_job_posted', (jobData) => {
        console.log('📢 Manual Broadcast for:', jobData.title);
        io.emit('receive_job_alert', jobData); // io.emit sends to EVERYONE including sender
    });

    socket.on('disconnect', () => {
        console.log(`❌ User Disconnected: ${socket.id}`);
        io.emit('user_count_update', io.engine.clientsCount);
    });
});

/**
 * 2. SECURITY & LOGGING
 */
app.use(helmet({ 
    crossOriginResourcePolicy: false, 
    contentSecurityPolicy: false 
})); 

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); 
}

/**
 * 3. CORS CONFIGURATION
 */
const allowedOrigins = [
    "https://talent-bd-s.vercel.app", 
    "https://talent-bd-13.vercel.app", 
    "http://localhost:3000", 
    "http://localhost:5173", 
    "http://127.0.0.1:3000", 
    "http://127.0.0.1:5173",
    "http://192.168.0.106:3000",
    "http://192.168.0.106:5173"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('CORS blocked by TalentBD Engine Policy'));
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

/**
 * 4. DATABASE & REAL-TIME SEEDING
 */
const seedData = async () => {
    try {
        // 4a. Seed Categories
        const categoryCount = await Category.countDocuments();
        if (categoryCount === 0) {
            const prebuiltSectors = [
                { name: 'Government', group: 'job', icon: 'Shield', color: '#0f172a', priority: 10 },
                { name: 'Banking', group: 'job', icon: 'DollarSign', color: '#10b981', priority: 9 },
                { name: 'Software', group: 'job', icon: 'Code', color: '#2563eb', priority: 8 },
                { name: 'Education', group: 'job', icon: 'BookOpen', color: '#f59e0b', priority: 7 }
            ];
            await Category.insertMany(prebuiltSectors);
            console.log("⭐ Taxonomy Seeded.");
        }

        // 4b. Seed "Real" Jobs (This fixes your "no real job" issue)
        const jobCount = await Job.countDocuments();
        if (jobCount === 0) {
            const fakeJobs = [
                {
                    title: "MERN Stack Developer",
                    company: "Tech Solutions BD",
                    location: "Dhaka (Remote)",
                    salary: "45,000 - 65,000 BDT",
                    category: "Software",
                    jobType: "Full-time",
                    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
                    isLive: true
                },
                {
                    title: "Senior Accountant",
                    company: "Standard Bank Ltd",
                    location: "Chittagong",
                    salary: "Negotiable",
                    category: "Banking",
                    jobType: "Full-time",
                    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                    isLive: true
                }
            ];
            await Job.insertMany(fakeJobs);
            console.log("💼 Initial Circulars Seeded.");
        }

        // 4c. Seed Courses
        const courseCount = await Course.countDocuments();
        if (courseCount === 0) {
            await Course.create({ 
                title: 'Full-Stack MERN Mastery', 
                category: 'Software', 
                instructorName: 'TalentBD Academy',
                description: 'Build full-stack apps with MERN.',
                videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                skillTag: 'Web Development',
                lessons: 20,
                isActive: true,
                group: 'learning'
            });
            console.log("📚 Courseware Seeded.");
        }
    } catch (err) {
        console.error("⚠️ Seeding Error:", err.message);
    }
};

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ TalentBD Database Connected');
        seedData(); 
    });

/**
 * 5. ROUTE ARCHITECTURE
 */
app.use('/api/auth', require('./routes/auth'));      
app.use('/api/jobs', require('./routes/jobRoutes'));      
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/admin', require('./routes/adminRoutes')); 

app.get('/api/categories', async (req, res) => {
    try {
        const { group } = req.query;
        const filter = group ? { group: group.toLowerCase(), isActive: true } : { isActive: true };
        const categories = await Category.find(filter).sort({ priority: -1, name: 1 });
        res.json({ success: true, categories });
    } catch (err) {
        res.status(500).json({ success: false, error: "Sync failed" });
    }
});

/**
 * 6. MONITORING
 */
app.get('/', (req, res) => res.send('TalentBD Engine 2026 Active'));
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'Online', 
        activeUsers: io.engine.clientsCount 
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Engine & Live Circular Server Live on: ${PORT}`);
});