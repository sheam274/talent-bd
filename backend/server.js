require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan'); 
const helmet = require('helmet'); 
const Category = require('./models/Category'); // Required for Seeding

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
 * 2. CORS DYNAMIC CONFIGURATION
 */
const allowedOrigins = [
    "https://talent-bd-s.vercel.app", 
    "https://talent-bd-13.vercel.app", 
    "http://localhost:3000", 
    "http://localhost:5173", 
    "http://127.0.0.1:3000", 
    "http://127.0.0.1:5173",
    "http://192.168.0.106:3000",
    "http://192.168.0.106:5173" // Vite default for mobile testing
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
 * 3. DATABASE & AUTO-SEEDING ENGINE
 * Ensures Industry Sectors exist even on a fresh database.
 */
const seedSectors = async () => {
    try {
        const count = await Category.countDocuments();
        if (count === 0) {
            const prebuiltSectors = [
                { name: 'Government', group: 'job', icon: 'Shield', color: '#0f172a', priority: 10 },
                { name: 'Banking', group: 'job', icon: 'DollarSign', color: '#10b981', priority: 9 },
                { name: 'Software', group: 'job', icon: 'Code', color: '#2563eb', priority: 8 },
                { name: 'Education', group: 'job', icon: 'BookOpen', color: '#f59e0b', priority: 7 },
                { name: 'Marketing', group: 'job', icon: 'Megaphone', color: '#d946ef', priority: 6 }
            ];
            await Category.insertMany(prebuiltSectors);
            console.log("⭐ TalentBD Taxonomy Seeded: Prebuilt sectors deployed.");
        }
    } catch (err) {
        console.error("⚠️ Seeding Warning:", err.message);
    }
};

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('✅ TalentBD Cloud Database: Active and Synced');
    seedSectors(); // Trigger seeding on successful connection
})
.catch(err => console.error('❌ MongoDB Connection Failure:', err.message));

/**
 * 4. ROUTE ARCHITECTURE
 */
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const courseRoutes = require('./routes/courseRoutes');

app.use('/api/auth', authRoutes);      
app.use('/api/jobs', jobRoutes);      
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes); 

// FIXED TAXONOMY ROUTE: Explicitly defined for the Industry Hub
app.get('/api/categories', async (req, res) => {
    try {
        const { group } = req.query;
        const filter = group ? { group: group.toLowerCase(), isActive: true } : { isActive: true };
        const categories = await Category.find(filter).sort({ priority: -1, name: 1 });
        
        res.status(200).json({ 
            success: true,
            categories: categories // Ensure this matches frontend .map()
        });
    } catch (err) {
        res.status(500).json({ success: false, error: "Taxonomy sync failed" });
    }
});

/**
 * 5. SYSTEM MONITORING
 */
app.get('/', (req, res) => res.send('TalentBD 2026 Engine API is Running...'));

app.get('/api/health', (req, res) => {
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.status(200).json({ 
        status: 'Online', 
        database: states[mongoose.connection.readyState],
        timestamp: new Date()
    });
});

/**
 * 6. GLOBAL ERROR HANDLING
 */
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

app.use((err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    if (err.code === 11000) {
        error.message = `Duplicate entry found for: ${Object.keys(err.keyValue)}`;
        error.status = 400;
    }

    res.status(error.status || 500).json({ 
        success: false, 
        error: error.message || "Internal Server Error"
    });
});

/**
 * 7. SERVER INITIALIZATION
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TalentBD Engine Live on Port: ${PORT}`);
});