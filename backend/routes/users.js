const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' }, // 'admin' or 'user'
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    savedCV: {
        name: String,
        email: String,
        phone: String,
        summary: String,
        profileImage: String, // Stores the Base64 string
        template: { type: String, default: 'modern' },
        education: Array,
        skills: Array,
        experience: Array
    }
});

module.exports = mongoose.model('User', userSchema);