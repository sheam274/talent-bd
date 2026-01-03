require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();

// --- DYNAMIC CORS ---
// Replace with your actual frontend URL once deployed
app.use(cors({
    origin: ["http://localhost:3000", "https://your-frontend.vercel.app"], 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());

// --- DATABASE CONNECTION ---
const mongoURI = process.env.MONGO_URI;

// ✅ FIXED: Removed deprecated useNewUrlParser and useUnifiedTopology
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

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) { next(err); }
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
            console.log('🏁 Admin account seeded');
        }
    } catch (err) { }
}

// --- ROUTES ---
app.get('/', (req, res) => res.json({ status: "Active", service: "TalentBD API" }));

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

app.put('/api/users/update-progress', async (req, res) => {
    try {
        const { email, skill, points, walletBalance } = req.body;
        const updatedUser = await User.findOneAndUpdate(
            { email: email.toLowerCase().trim() },
            { 
                $addToSet: { skills: skill.toLowerCase() },
                $inc: { points: Number(points) || 0, walletBalance: Number(walletBalance) || 0 } 
            },
            { new: true }
        ).select('-password');
        res.json(updatedUser);
    } catch (e) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// --- VERCEL EXPORT ---
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Local Server on port ${PORT}`));
}