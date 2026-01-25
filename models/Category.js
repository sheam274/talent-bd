const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    group: { type: String, enum: ['job', 'learning'], required: true },
    icon: { type: String, default: '📁' }
}, { timestamps: true });
module.exports = mongoose.model('Category', categorySchema);
