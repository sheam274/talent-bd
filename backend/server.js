require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();

// --- MIDDLEWARE ---
app.use(express.json()); 
app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// --- 1. DATABASE CONNECTION ---
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/talentbd';
mongoose.connect(mongoURI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        seedAdmin(); 
    })
    .catch(err => console.error('❌ Connection Error:', err.message));

// --- 2. MODELS (Inlined for simplicity, or import from ./models) ---
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true }, 
    role: { type: String, default: 'user', enum: ['user', 'admin'] },
    walletBalance: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    skills: { type: [String], default: [] },
    // Preserve CV & Bookmark features
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    savedCV: { type: Object, default: {} }
}, { timestamps: true });

// Password Hashing Middleware
UserSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', UserSchema);

// --- SEEDING FEATURE ---
async function seedAdmin() {
    try {
        const adminEmail = 'admin@test.com';
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            console.log('⏳ Seeding admin account...');
            const admin = new User({
                name: 'System Admin',
                email: adminEmail,
                password: '123456', 
                role: 'admin',
                walletBalance: 1000,
                points: 500
            });
            await admin.save();
            console.log(`🏁 Admin created: ${adminEmail} / 123456`);
        }
    } catch (err) {
        console.error('❌ Seeding Error:', err.message);
    }
}

// --- 3. ROUTES ---

// Registration
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
        
        const cleanEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) return res.status(400).json({ error: 'Email already registered' });

        const user = new User({ name, email: cleanEmail, password, role: role || 'user' });
        await user.save();
        
        const userResponse = user.toObject();
        delete userResponse.password;
        res.status(201).json({ success: true, user: userResponse });
    } catch (e) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const cleanEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: cleanEmail });
        
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const userResponse = user.toObject();
        delete userResponse.password;
        
        // Add virtual level for frontend UI sync
        userResponse.level = Math.floor((user.points || 0) / 1000) + 1;
        
        res.json(userResponse);
    } catch (e) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Learning Hub Progress (XP & Wallet Sync)
app.put('/api/users/update-progress', async (req, res) => {
    try {
        const { email, skill, points, walletBalance } = req.body;
        
        const updatedUser = await User.findOneAndUpdate(
            { email: email.toLowerCase().trim() },
            { 
                $addToSet: { skills: skill.toLowerCase() },
                $inc: { 
                    points: Number(points) || 0, 
                    walletBalance: Number(walletBalance) || 0 
                } 
            },
            { new: true }
        ).select('-password');
        
        if (!updatedUser) return res.status(404).json({ error: "User not found" });
        res.json(updatedUser);
    } catch (e) {
        res.status(500).json({ error: 'Update failed' });
    }
});

app.get('/', (req, res) => res.send('TalentBD API Active'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));