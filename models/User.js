const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    walletBalance: { type: Number, default: 0 },
    points: { type: Number, default: 0 }
});
module.exports = mongoose.model('User', userSchema);
