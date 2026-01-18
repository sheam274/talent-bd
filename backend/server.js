require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const morgan = require('morgan'); // ADDED: For request logging
const helmet = require('helmet'); // ADDED: For security

// --- IMPORT ROUTERS (The files we just finished) ---
const courseRoutes = require('./routes/courseRoutes'); 
const jobRoutes = require('./routes/jobRoutes');
const atsRoutes = require('./routes/atsRoutes');
const cvRoutes = require('./routes/cvRoutes');

const app = express();

// --- MIDDLEWARE ---
app.use(helmet()); // Protects headers
app.use(morgan('dev')); // Logs requests to your terminal (HP-840 monitoring)
app.use(cors({
    origin: ["http://localhost:3000", "https://talent-bd.vercel.app"], 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

// --- DATABASE CONNECTION ---
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/talentbd";

let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000, // Sync for fast failure detection
        });
        isConnected = true;
        console.log('✅ Talent-BD Engine: Connected to MongoDB 7.0');
        seedAdmin();
    } catch (err) {
        console.error('❌ Connection Error:', err.message);
    }
};
connectDB();

// --- MODELS (Synced with User.js) ---
const User = require('./models/User'); // Using the Master User model we built

// --- SEEDING (Preserved & Fixed) ---
async function seedAdmin() {
    try {
        const adminEmail = 'admin@test.com';
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            // Note: Password hashing happens automatically via pre-save hook
            const admin = new User({
                name: 'System Admin',
                email: adminEmail,
                password: 'adminpassword123', 
                role: 'admin',
                walletBalance: 5000,
                points: 2500,
                savedCV: { summary: "System Administrator for TalentBD" }
            });
            await admin.save();
            console.log('🏁 Admin account seeded successfully');
        }
    } catch (err) { console.error("Seeding error:", err); }
}

// --- BASE API ROUTES ---
app.get('/', (req, res) => res.json({ 
    status: "Active", 
    service: "TalentBD Intelligence API",
    temperature: "44°C Optimized" // A little easter egg for your hardware monitoring
}));

// --- AUTH ROUTES (Preserved with Sync) ---
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const cleanEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) return res.status(400).json({ error: 'Email already registered' });

        const user = new User({ name, email: cleanEmail, password, role: role || 'user' });
        await user.save();
        
        const userResponse = user.toObject();
        delete userResponse.password;
        res.status(201).json({ success: true, user: userResponse });
    } catch (e) { res.status(500).json({ error: 'Registration failed' }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase().trim() })
            .populate('bookmarks')
            .populate('purchasedCourses');
            
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const userResponse = user.toObject();
        delete userResponse.password;
        // The 'level' virtual is already in the model, but we ensure it's sent
        res.json(userResponse);
    } catch (e) { res.status(500).json({ error: 'Internal server error' }); }
});

// --- SYNCED FEATURE ROUTES ---
app.use('/api/courses', courseRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/cv', cvRoutes);

// --- UPDATE PROGRESS (Preserved & Enhanced) ---
app.put('/api/users/update-progress', async (req, res) => {
    try {
        const { email, skill, points, walletBalance } = req.body;
        const updateData = {
            $inc: { points: Number(points) || 0, walletBalance: Number(walletBalance) || 0 }
        };
        // If a new skill is provided, add it to the verified list
        if (skill) updateData.$addToSet = { verifiedSkills: skill.toLowerCase() };

        const updatedUser = await User.findOneAndUpdate(
            { email: email.toLowerCase().trim() },
            updateData,
            { new: true }
        ).select('-password');
        res.json(updatedUser);
    } catch (e) { res.status(500).json({ error: 'Update failed' }); }
});

// --- VERCEL CATCH-ALL ---
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.url} not found on TalentBD.` });
});

// --- EXPORT FOR VERCEL ---
module.exports = app;

// --- LOCAL LISTENER ---
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 TalentBD Server: http://localhost:${PORT}`);
        console.log(`💻 Hardware: HP-840 G3 (i5-6300U) | Temp: 44°C Safe`);
    });
}