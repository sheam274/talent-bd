require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();

// --- DYNAMIC CORS (Fixes Local vs Vercel mismatch) ---
const allowedOrigins = [
    'http://localhost:3000',
    'https://your-frontend-vercel-url.vercel.app' // ADD YOUR VERCEL FRONTEND URL HERE
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

// --- DATABASE CONNECTION ---
// Use process.env.MONGO_URI for Vercel, fallback to local for dev
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        seedAdmin();
    })
    .catch(err => console.error('❌ Connection Error:', err.message));

// --- MODELS ---
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user', enum: ['user', 'admin'] },
    walletBalance: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    skills: { type: [String], default: [] },
    savedCV: { type: Object, default: {} }
}, { timestamps: true });

// Fixed Password Hashing Middleware
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// --- SEEDING ---
async function seedAdmin() {
    try {
        const adminEmail = 'admin@test.com';
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const admin = new User({
                name: 'System Admin',
                email: adminEmail,
                password: '123456',
                role: 'admin',
                walletBalance: 1000,
                points: 500
            });
            await admin.save();
            console.log(`🏁 Admin created: ${adminEmail}`);
        }
    } catch (err) { /* Silently handle for serverless */ }
}

// --- ROUTES ---
app.get('/', (req, res) => res.send('TalentBD API Active'));

app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) return res.status(400).json({ error: 'Email already registered' });

        const user = new User({ name, email, password, role: role || 'user' });
        await user.save();
        
        const userResponse = user.toObject();
        delete userResponse.password;
        res.status(201).json({ success: true, user: userResponse });
    } catch (e) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const userResponse = user.toObject();
        delete userResponse.password;
        userResponse.level = Math.floor((user.points || 0) / 1000) + 1;
        res.json(userResponse);
    } catch (e) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// IMPORTANT FOR VERCEL: Export the app
module.exports = app;

// Only listen if not in a serverless environment (local dev)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Local Server on port ${PORT}`));
}