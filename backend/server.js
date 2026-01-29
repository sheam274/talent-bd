require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan'); 
const helmet = require('helmet'); 

const app = express();

/**
 * 1. SECURITY & LOGGING
 * Configured to allow cross-origin images (important for professional profiles/logos)
 */
app.use(helmet({ 
    crossOriginResourcePolicy: false, 
    contentSecurityPolicy: false 
})); 

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); 
}

// CORS Dynamic Configuration: Supports Local, Mobile Testing, and Vercel Production
const allowedOrigins = [
    "http://localhost:3000", 
    "http://localhost:5173", 
    "http://127.0.0.1:3000", 
    "http://127.0.0.1:5173",
    "http://192.168.0.106:3000", // Your Network IP for Mobile Testing
    "https://talent-bd-13.vercel.app" // Your Specific Vercel URL
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error('CORS Blocked by TalentBD Security Policy'));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true
}));

/**
 * 2. BODY PARSING
 * Increased limit to 15mb to handle base64 images for CVs/Certificates
 */
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

/**
 * 3. DATABASE CONNECTION
 * Using the talentbd database specifically from your URI
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

// API Mount Points
app.use('/api/auth', authRoutes);      
app.use('/api/jobs', jobRoutes);      
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes); // Mounted specifically to /admin

/**
 * Taxonomy Sync: 
 * Handles the /api/categories request mentioned in your Jobs.js logic
 */
const Category = require('./models/Category'); // Ensure this model exists
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

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: `TalentBD Engine: Endpoint ${req.originalUrl} not found.` 
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

// Handle sudden crashes (like MongoDB timeouts)
process.on('unhandledRejection', (err) => {
    console.error(`🔴 Unhandled System Rejection: ${err.message}`);
    // server.close(() => process.exit(1)); // Optional: keep alive on Render
});