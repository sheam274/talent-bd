require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan'); 
const helmet = require('helmet'); 

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
 * CORS Dynamic Configuration
 * Includes your specific Vercel URL and local development environments.
 */
const allowedOrigins = [
    "https://talent-bd-s.vercel.app", // Your NEW specific Vercel URL
    "https://talent-bd-13.vercel.app", // Your secondary Vercel URL
    "http://localhost:3000", 
    "http://localhost:5173", 
    "http://127.0.0.1:3000", 
    "http://127.0.0.1:5173",
    "http://192.168.0.106:3000" // Your Network IP for Mobile Testing
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or curl)
        // Or if the origin is in our allowed list
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('CORS blocked by TalentBD Engine Policy'));
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true
}));

/**
 * 2. BODY PARSING
 */
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

/**
 * 3. DATABASE CONNECTION
 */
const MONGO_URI = process.env.MONGO_URI;

mongoose.set('strictQuery', false);
mongoose.connect(MONGO_URI)
.then(() => console.log('✅ TalentBD Cloud Database: Active and Synced'))
.catch(err => {
    console.error('❌ MongoDB Connection Failure:', err.message);
});

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

// Taxonomy Sync Route
const Category = require('./models/Category'); 
app.get('/api/categories', async (req, res) => {
    try {
        const group = req.query.group || 'job';
        const categories = await Category.find({ group });
        res.status(200).json({ categories });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch taxonomy" });
    }
});

/**
 * 5. SYSTEM HEALTH & MONITORING
 */
app.get('/', (req, res) => {
    res.send('TalentBD 2026 Engine API is Running...');
});

app.get('/api/health', (req, res) => {
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.status(200).json({ 
        status: 'Online', 
        uptime: `${Math.floor(process.uptime())}s`,
        database: states[mongoose.connection.readyState],
        timestamp: new Date().toISOString()
    });
});

app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: `Endpoint ${req.originalUrl} not found.` 
    });
});

/**
 * 6. GLOBAL ERROR HANDLING
 */
app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    res.status(statusCode).json({ 
        success: false, 
        error: err.message || "Internal Server Error"
    });
});

/**
 * 7. SERVER INITIALIZATION
 */
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TalentBD 2026 Engine Live on Port: ${PORT}`);
});

process.on('unhandledRejection', (err) => {
    console.error(`🔴 Unhandled System Rejection: ${err.message}`);
});