require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan'); 
const helmet = require('helmet'); 
const http = require('http'); 
const { Server } = require('socket.io'); 

// Models - Ensure these paths and filenames are exactly correct in your Kali Linux folders
const Category = require('./models/Category'); 
const Course = require('./models/Course'); 
const Job = require('./models/Job');

const app = express();

// --- VERCEL/RENDER PROXY FIX ---
app.set('trust proxy', 1); 

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
            "http://127.0.0.1:3000"
        ],
        methods: ["GET", "POST"],
        credentials: true
    },
    // Required for stability on Render/Vercel
    transports: ['websocket', 'polling'] 
});

app.set('io', io);

io.on('connection', (socket) => {
    console.log(`⚡ User Connected: ${socket.id}`);
    io.emit('user_count_update', io.engine.clientsCount);

    socket.on('new_job_posted', (jobData) => {
        io.emit('receive_job_alert', jobData); 
    });

    socket.on('disconnect', () => {
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
    "http://127.0.0.1:3000"
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

/**
 * 4. DATABASE & SEEDING
 */
// Use process.env.MONGO_URI - ensure this is set in your Render environment variables!
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ TalentBD Database Connected');
        // Seeding disabled - data already in database
        // seedData(); 
    })
    .catch(err => console.error("❌ Database Connection Failed:", err));

/**
 * ENHANCED SEEDING FUNCTION - 2026 Engine
 * Adds demo jobs, categories, and video courses
 */
const seedData = async () => {
    try {
        // ===== 1. SEED CATEGORIES =====
        const categoryCount = await Category.countDocuments();
        if (categoryCount === 0) {
            await Category.insertMany([
                // Job Categories
                { name: 'Government', group: 'job', icon: 'Shield', color: '#0f172a', priority: 10, isActive: true },
                { name: 'Banking', group: 'job', icon: 'DollarSign', color: '#10b981', priority: 9, isActive: true },
                { name: 'Software', group: 'job', icon: 'Code', color: '#2563eb', priority: 8, isActive: true },
                { name: 'IT & Telecommunication', group: 'job', icon: 'Cpu', color: '#2563eb', priority: 7, isActive: true },
                { name: 'Marketing/Sales', group: 'job', icon: 'Megaphone', color: '#f59e0b', priority: 6, isActive: true },
                { name: 'Engineering', group: 'job', icon: 'Terminal', color: '#1e293b', priority: 5, isActive: true },
                
                // Learning Categories
                { name: 'Frontend', group: 'learning', icon: 'Code', color: '#2563eb', priority: 10, isActive: true },
                { name: 'Backend', group: 'learning', icon: 'Terminal', color: '#1e293b', priority: 9, isActive: true },
                { name: 'MERN', group: 'learning', icon: 'Cpu', color: '#61dafb', priority: 8, isActive: true },
                { name: 'NextJS', group: 'learning', icon: 'Zap', color: '#000', priority: 7, isActive: true },
                { name: 'Python', group: 'learning', icon: 'Code', color: '#3776ab', priority: 6, isActive: true },
                { name: 'DevOps', group: 'learning', icon: 'Globe', color: '#6366f1', priority: 5, isActive: true }
            ]);
            console.log("⭐ Categories Seeded.");
        }

        // ===== 2. SEED JOBS =====
        const jobCount = await Job.countDocuments();
        if (jobCount === 0) {
            const softwareCat = await Category.findOne({ name: 'Software', group: 'job' });
            const itCat = await Category.findOne({ name: 'IT & Telecommunication', group: 'job' });
            
            await Job.insertMany([
                {
                    title: "Senior MERN Stack Developer",
                    company: "Tech Solutions BD",
                    location: "Dhaka (Remote)",
                    salary: "60,000 - 85,000 BDT",
                    category: "Software",
                    categoryRef: softwareCat?._id,
                    jobType: "full-time",
                    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    isLive: true,
                    isFeatured: true,
                    description: "Looking for experienced MERN stack developers with 3+ years experience.",
                    tags: ['mern', 'react', 'nodejs', 'mongodb'],
                    requiredSkills: ['React', 'Node.js', 'MongoDB', 'JavaScript']
                },
                {
                    title: "React Frontend Engineer",
                    company: "Digital Agency Pro",
                    location: "Dhaka, Bangladesh",
                    salary: "45,000 - 70,000 BDT",
                    category: "Software",
                    categoryRef: softwareCat?._id,
                    jobType: "full-time",
                    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
                    isLive: true,
                    description: "Build responsive web applications using modern React patterns.",
                    tags: ['react', 'frontend', 'javascript', 'typescript'],
                    requiredSkills: ['React', 'JavaScript', 'CSS', 'HTML']
                },
                {
                    title: "Node.js Backend Developer",
                    company: "StartUp India",
                    location: "Remote",
                    salary: "50,000 - 75,000 BDT",
                    category: "IT & Telecommunication",
                    categoryRef: itCat?._id,
                    jobType: "full-time",
                    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                    isLive: true,
                    description: "Develop scalable backend services using Node.js and Express.",
                    tags: ['nodejs', 'backend', 'express', 'api'],
                    requiredSkills: ['Node.js', 'Express', 'MongoDB', 'REST API']
                },
                {
                    title: "Full Stack Developer (MERN)",
                    company: "E-commerce Solutions",
                    location: "Worldwide (Remote)",
                    salary: "70,000 - 95,000 BDT",
                    category: "Software",
                    categoryRef: softwareCat?._id,
                    jobType: "full-time",
                    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
                    isLive: true,
                    isFeatured: true,
                    description: "Build end-to-end web applications with MERN stack.",
                    tags: ['mern', 'fullstack', 'react', 'nodejs'],
                    requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express']
                },
                {
                    title: "Next.js Developer",
                    company: "Modern Web Studio",
                    location: "Remote",
                    salary: "55,000 - 80,000 BDT",
                    category: "IT & Telecommunication",
                    categoryRef: itCat?._id,
                    jobType: "full-time",
                    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
                    isLive: true,
                    description: "Develop modern web applications with Next.js 15+.",
                    tags: ['nextjs', 'react', 'typescript', 'frontend'],
                    requiredSkills: ['Next.js', 'React', 'TypeScript', 'Vercel']
                }
            ]);
            console.log("💼 Live Circulars Seeded (5 jobs).");
        }

        // ===== 3. SEED COURSES =====
        const courseCount = await Course.countDocuments();
        if (courseCount === 0) {
            const courses = [];
            const categoryNames = ['Frontend', 'Backend', 'MERN', 'NextJS', 'Python', 'DevOps'];
            
            // Get category references
            const catMap = {};
            for (const name of categoryNames) {
                const cat = await Category.findOne({ name, group: 'learning' });
                if (cat) catMap[name] = cat._id;
            }

            const courseData = [
                { title: 'Full Stack Web Development 2026', video: 'https://www.youtube.com/watch?v=QOOLshsQvpY', tag: 'Fullstack', category: 'MERN', description: 'Comprehensive roadmap for the 2026 tech ecosystem.' },
                { title: 'Modern MERN Architecture', video: 'https://www.youtube.com/watch?v=GxmfcnU3feo', tag: 'MERN', category: 'MERN', description: 'Deep dive into scalable Node.js patterns for 2026.' },
                { title: 'Advanced React 19 Patterns', video: 'https://www.youtube.com/watch?v=Zq5fmkH0T78', tag: 'Frontend', category: 'Frontend', description: 'Server components, actions, and modern hydration.' },
                { title: 'Next.js 15 Masterclass', video: 'https://www.youtube.com/watch?v=ek7hmv5PVV8', tag: 'NextJS', category: 'NextJS', description: 'Building production-ready apps with App Router.' },
                { title: 'Node.js Advanced Patterns', video: 'https://www.youtube.com/watch?v=Y-Uu0MxcJ7Y', tag: 'Backend', category: 'Backend', description: 'Master Node.js streams, clustering, and optimization.' },
                { title: 'Express.js REST APIs', video: 'https://www.youtube.com/watch?v=dvb3bWQUYKk', tag: 'Backend', category: 'Backend', description: 'Build scalable REST APIs with Express.js.' },
                { title: 'MongoDB Mastery', video: 'https://www.youtube.com/watch?v=rymztqLt2AE', tag: 'Backend', category: 'Backend', description: 'Database design and optimization with MongoDB.' },
                { title: 'TypeScript Fundamentals', video: 'https://www.youtube.com/watch?v=gieEQFIfgYc', tag: 'Frontend', category: 'Frontend', description: 'Master TypeScript for large-scale applications.' },
                { title: 'React Hooks Deep Dive', video: 'https://www.youtube.com/watch?v=O7Fh8YqJgd0', tag: 'Frontend', category: 'Frontend', description: 'Understanding React Hooks for modern components.' },
                { title: 'CSS Grid & Flexbox Pro', video: 'https://www.youtube.com/watch?v=3vwmnxiEz0w', tag: 'Frontend', category: 'Frontend', description: 'Master modern CSS layout techniques.' },
                { title: 'GraphQL API Development', video: 'https://www.youtube.com/watch?v=ed8SzALpx1Q', tag: 'Backend', category: 'Backend', description: 'Build powerful GraphQL APIs with Apollo.' },
                { title: 'Docker & Containerization', video: 'https://www.youtube.com/watch?v=Kyx2PsuwomE', tag: 'DevOps', category: 'DevOps', description: 'Master Docker for development and deployment.' },
                { title: 'Kubernetes for Beginners', video: 'https://www.youtube.com/watch?v=X48VuDVv0Sg', tag: 'DevOps', category: 'DevOps', description: 'Deploy and manage containerized applications.' },
                { title: 'Python Web Development', video: 'https://www.youtube.com/watch?v=bKFAj034DqA', tag: 'Python', category: 'Python', description: 'Build web applications with Flask and Django.' },
                { title: 'Python for Data Science', video: 'https://www.youtube.com/watch?v=W9XjRYFV5Pc', tag: 'Python', category: 'Python', description: 'Data analysis and visualization with Python.' },
                { title: 'Testing React Applications', video: 'https://www.youtube.com/watch?v=3e1GHWWF2R0', tag: 'Frontend', category: 'Frontend', description: 'Unit and integration testing for React apps.' },
                { title: 'Web Performance Optimization', video: 'https://www.youtube.com/watch?v=3ZJCmYZJ3Nk', tag: 'Frontend', category: 'Frontend', description: 'Optimize your web apps for speed and efficiency.' },
                { title: 'Webpack & Module Bundling', video: 'https://www.youtube.com/watch?v=Ufhpq3bP0EI', tag: 'Frontend', category: 'Frontend', description: 'Master modern build tools for web development.' },
                { title: 'CI/CD Pipeline Setup', video: 'https://www.youtube.com/watch?v=r8ktBvZ92lY', tag: 'DevOps', category: 'DevOps', description: 'Automate your deployment pipeline.' },
                { title: 'PostgreSQL Database Design', video: 'https://www.youtube.com/watch?v=5Ey4gJ-PFIY', tag: 'Backend', category: 'Backend', description: 'Design efficient relational databases.' },
                { title: 'AWS Cloud Services', video: 'https://www.youtube.com/watch?v=ulprqHHWlng', tag: 'DevOps', category: 'DevOps', description: 'Deploy applications on AWS cloud infrastructure.' },
                { title: 'Responsive Web Design', video: 'https://www.youtube.com/watch?v=FEmysQftXqM', tag: 'Frontend', category: 'Frontend', description: 'Build mobile-first responsive websites.' }
            ];

            for (const data of courseData) {
                const catId = catMap[data.category];
                if (catId) {
                    courses.push({
                        title: data.title,
                        video: data.video,
                        videoUrl: data.video,
                        tag: data.tag,
                        category: data.category,
                        categoryRef: catId,
                        skillTag: data.tag.toLowerCase(),
                        description: data.description,
                        duration: '15 min',
                        thumbnail: '',
                        difficulty: 'Beginner',
                        price: 0,
                        instructor: null,
                        isActive: true
                    });
                }
            }

            if (courses.length > 0) {
                await Course.insertMany(courses);
                console.log(`📚 ${courses.length} Learning Modules Seeded.`);
            }
        }
    } catch (err) {
        console.error("⚠️ Seeding Error:", err.message);
    }
};

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
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        activeUsers: io.engine.clientsCount 
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Engine Live on Port: ${PORT}`);
});