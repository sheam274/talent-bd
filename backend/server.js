require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const morgan = require('morgan'); 
const helmet = require('helmet'); 

// --- 1. MODELS IMPORT ---
const { User, Job, Course, Category } = require('./models'); 

// --- 2. ROUTER IMPORTS ---
const courseRoutes = require('./routes/courseRoutes'); 
const jobRoutes    = require('./routes/jobRoutes');   
const atsRoutes    = require('./routes/scanner');    
const cvRoutes     = require('./routes/cvRoutes');   
const adminRoutes  = require('./routes/adminRoutes');
const walletRoutes = require('./routes/walletRoutes');
const authRoutes   = require('./routes/auth');

const app = express();

// --- 3. MIDDLEWARE ---
app.use(helmet({ crossOriginResourcePolicy: false })); 
app.use(morgan('dev')); 
app.use(cors({
    origin: ["http://localhost:3000", "https://talent-bd-13.vercel.app"], 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

// --- 4. DATABASE CONNECTION ---
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/talentbd";
mongoose.connect(mongoURI)
    .then(() => console.log('✅ Talent-BD Engine: Synced with MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- 5. ADMIN CATEGORY API ---
app.post('/api/admin/categories', async (req, res) => {
    try {
        const { name, group, icon } = req.body;
        if (!name || !group) return res.status(400).json({ error: "Missing fields" });
        const category = await Category.create({ 
            name: name.trim(), 
            group: group.toLowerCase(), 
            icon: icon || (group === 'job' ? '💼' : '🎓') 
        });
        res.status(201).json({ success: true, category });
    } catch (err) { res.status(400).json({ error: "Sync failed: Duplicate Category" }); }
});

app.delete('/api/admin/categories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Category deleted" });
    } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

app.get('/api/categories', async (req, res) => {
    try {
        const { group } = req.query;
        const filter = group ? { group: group.toLowerCase() } : {};
        const cats = await Category.find(filter).sort({ name: 1 });
        res.json(cats);
    } catch (err) { res.status(500).json({ error: "Fetch error" }); }
});

// --- 6. AUTHENTICATION ---
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (user && await bcrypt.compare(password, user.password)) {
            const { password: _, ...data } = user._doc;
            return res.json(data);
        }
        res.status(401).json({ error: 'Invalid credentials' });
    } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// --- 7. ROUTE MOUNTING ---
app.use('/api/courses', courseRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/auth', authRoutes);

// --- 8. GLOBAL ERROR & PORT HANDLER ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Sync Error" });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Engine Active: http://localhost:${PORT}`);
});

// --- FIX EADDRINUSE (Ghost Process Handler) ---
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is busy. Cleaning up...`);
        process.exit(1);
    }
});