require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan'); 
const helmet = require('helmet'); 

// Models
const Category = require('./models/Category'); 
const Course = require('./models/Course'); 

const app = express();

/**
 * 1. SECURITY & LOGGING
 */
app.use(helmet({ 
    crossOriginResourcePolicy: false, 
    contentSecurityPolicy: false 
})); 

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); 
}

/**
 * 2. CORS CONFIGURATION
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
 * 3. DATABASE & ENHANCED AUTO-SEEDING
 * Fixed: Handles strict validation for Courses
 */
const seedData = async () => {
    try {
        // --- SEED CATEGORIES FIRST ---
        let softwareCategory = await Category.findOne({ name: 'Software' });
        
        const categoryCount = await Category.countDocuments();
        if (categoryCount === 0) {
            const prebuiltSectors = [
                { name: 'Government', group: 'job', icon: 'Shield', color: '#0f172a', priority: 10 },
                { name: 'Banking', group: 'job', icon: 'DollarSign', color: '#10b981', priority: 9 },
                { name: 'Software', group: 'job', icon: 'Code', color: '#2563eb', priority: 8 },
                { name: 'Education', group: 'job', icon: 'BookOpen', color: '#f59e0b', priority: 7 },
                { name: 'Marketing', group: 'job', icon: 'Megaphone', color: '#d946ef', priority: 6 }
            ];
            const created = await Category.insertMany(prebuiltSectors);
            softwareCategory = created.find(c => c.name === 'Software');
            console.log("⭐ Taxonomy Seeded.");
        }

        // --- SEED COURSES ---
        const courseCount = await Course.countDocuments();
        if (courseCount === 0) {
            // Generate a valid temporary ObjectId to avoid "Cast to ObjectId failed"
            const placeholderId = new mongoose.Types.ObjectId();

            const prebuiltCourses = [
                { 
                    title: 'Full-Stack MERN Mastery', 
                    category: 'Software', 
                    categoryRef: softwareCategory ? softwareCategory._id : placeholderId,
                    instructor: placeholderId, // Must be an ObjectId
                    description: 'Comprehensive guide to building full-stack applications with MongoDB, Express, React, and Node.js.',
                    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    skillTag: 'Web Development',
                    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
                    lessons: 20,
                    isActive: true,
                    group: 'learning'
                }
            ];
            await Course.insertMany(prebuiltCourses);
            console.log("📚 Courseware Seeded.");
        }
    } catch (err) {
        console.error("⚠️ Seeding Error:", err.message);
    }
};

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('✅ TalentBD Database Connected');
    seedData(); 
})
.catch(err => console.error('❌ Connection Failure:', err.message));

/**
 * 4. ROUTE ARCHITECTURE
 */
app.use('/api/auth', require('./routes/auth'));      
app.use('/api/jobs', require('./routes/jobRoutes'));      
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/admin', require('./routes/adminRoutes')); 

// --- CATEGORY API ---
app.get('/api/categories', async (req, res) => {
    try {
        const { group } = req.query;
        const filter = group ? { group: group.toLowerCase(), isActive: true } : { isActive: true };
        const categories = await Category.find(filter).sort({ priority: -1, name: 1 });
        res.status(200).json({ success: true, categories });
    } catch (err) {
        res.status(500).json({ success: false, error: "Sync failed" });
    }
});

// --- COURSE API ---
app.post('/api/courses', async (req, res) => {
    try {
        const newCourse = new Course(req.body);
        const saved = await newCourse.save();
        res.status(201).json({ success: true, course: saved });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

/**
 * 5. MONITORING & HEALTH
 */
app.get('/', (req, res) => res.send('TalentBD Engine 2026 is Active'));
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Online', database: mongoose.connection.readyState });
});

/**
 * 6. GLOBAL ERROR HANDLING
 */
app.use((req, res) => res.status(404).json({ success: false, message: "Route Not Found" }));
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ success: false, error: err.message });
});

/**
 * 7. START SERVER
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Engine Live on: ${PORT}`);
});