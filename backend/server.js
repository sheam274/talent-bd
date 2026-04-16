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
const seedData = async () => {
    try {
        const categoryCount = await Category.countDocuments();
        if (categoryCount === 0) {
            await Category.insertMany([
                { name: 'Government', group: 'job', icon: 'Shield', color: '#0f172a', priority: 10, isActive: true },
                { name: 'Banking', group: 'job', icon: 'DollarSign', color: '#10b981', priority: 9, isActive: true },
                { name: 'Software', group: 'job', icon: 'Code', color: '#2563eb', priority: 8, isActive: true }
            ]);
            console.log("⭐ Taxonomy Seeded.");
        }

        const jobCount = await Job.countDocuments();
        if (jobCount === 0) {
            await Job.insertMany([
                {
                    title: "MERN Stack Developer",
                    company: "Tech Solutions BD",
                    location: "Dhaka (Remote)",
                    salary: "45,000 - 65,000 BDT",
                    category: "Software",
                    jobType: "Full-time",
                    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                    isLive: true
                }
            ]);
            console.log("💼 Initial Circulars Seeded.");
        }
    } catch (err) {
        console.error("⚠️ Seeding Error:", err.message);
    }
};

// Use process.env.MONGO_URI - ensure this is set in your Render environment variables!
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ TalentBD Database Connected');
        seedData(); 
    })
    .catch(err => console.error("❌ Database Connection Failed:", err));

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