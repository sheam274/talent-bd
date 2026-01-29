const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Category name is required'], 
        trim: true 
    },
    // Slug is used for clean URLs (e.g., talentbd.com/jobs/software-engineering)
    slug: {
        type: String,
        lowercase: true,
        trim: true,
        index: true
    },
    group: { 
        type: String, 
        required: [true, 'Group type is required (job or learning)'], 
        enum: {
            values: ['job', 'learning'],
            message: '{VALUE} is not a supported category group'
        }, 
        lowercase: true,
        trim: true
    },
    // For Lucide-react or Emoji support
    icon: { 
        type: String, 
        default: 'Briefcase' 
    }, 
    // Hex code for frontend UI badges (e.g., '#2563eb')
    color: { 
        type: String, 
        default: '#2563eb' 
    },
    // Priority sorting: higher numbers appear first in the sidebar
    priority: { 
        type: Number, 
        default: 0,
        index: true 
    },
    isActive: { 
        type: Boolean, 
        default: true, 
        index: true 
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// --- 1. PERFORMANCE INDEXING ---
/**
 * Composite unique index: Prevents duplicate names WITHIN the same group.
 * Allows "Design" to exist as both a job sector and a learning domain.
 */
CategorySchema.index({ name: 1, group: 1 }, { unique: true });

// --- 2. MIDDLEWARE: AUTO-SLUG GENERATION ---
CategorySchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')     // Remove non-alphanumeric
            .replace(/[\s_-]+/g, '-')     // Replace spaces/underscores with hyphens
            .replace(/^-+|-+$/g, '');     // Trim leading/trailing hyphens
    }
    next();
});

// --- 3. VIRTUALS ---
// Useful for frontend logic to check if a category is considered "Hot" or "High Priority"
CategorySchema.virtual('isFeatured').get(function() {
    return this.priority >= 10;
});

module.exports = mongoose.model('Category', CategorySchema);