const mongoose = require('mongoose');

/**
 * CATEGORY SCHEMA: The Global Sync Engine
 * This model controls the dynamic filters for both Jobs and Learning.
 * Responsive UI on the frontend maps through these groups.
 */
const CategorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true, // Prevents duplicate categories
        trim: true 
    },
    group: { 
        type: String, 
        required: true, 
        enum: ['job', 'learning'], // Sync point: job board or learning hub
        default: 'job'
    },
    icon: { 
        type: String, 
        default: '📁', // Default responsive icon
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true // Allows admin to "hide" without hard deleting if preferred
    }
}, { 
    timestamps: true // Tracks when categories were added for "New" badges in UI
});

// Optimization: Indexing the group for faster responsive filtering
CategorySchema.index({ group: 1 });

module.exports = mongoose.model('Category', CategorySchema);