const mongoose = require('mongoose');

/**
 * TALENTBD UNIFIED CATEGORY SCHEMA (2026 EDITION)
 * Handles both Job Industries and Learning Domains.
 */
const CategorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Category name is required'], 
        trim: true 
    },
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
        trim: true,
        index: true
    },
    icon: { 
        type: String, 
        default: 'Briefcase' 
    }, 
    color: { 
        type: String, 
        default: '#2563eb' 
    },
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
// Unique compound index: prevents duplicate names within the SAME group
// This allows "Marketing" to exist in BOTH 'job' and 'learning'
CategorySchema.index({ name: 1, group: 1 }, { unique: true });
CategorySchema.index({ slug: 1, group: 1 }, { unique: true });

// --- 2. MIDDLEWARE: AUTO-GENERATION & SMART THEMING ---
CategorySchema.pre('validate', function(next) {
    // A. URL-Friendly Slug Generation
    if (this.isModified('name') || !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')     // Remove non-alphanumeric
            .replace(/[\s_-]+/g, '-')     // Replace spaces/underscores with hyphens
            .replace(/^-+|-+$/g, '');     // Trim trailing/leading hyphens
    }

    // B. Smart Icon & Color Mapping
    const iconMap = {
        'code': { icon: 'Code', color: '#2563eb' },
        'software': { icon: 'Cpu', color: '#2563eb' },
        'dev': { icon: 'Terminal', color: '#1e293b' },
        'design': { icon: 'Palette', color: '#d946ef' },
        'market': { icon: 'Megaphone', color: '#f59e0b' },
        'bank': { icon: 'DollarSign', color: '#10b981' },
        'money': { icon: 'Wallet', color: '#10b981' },
        'data': { icon: 'BarChart3', color: '#3b82f6' },
        'writer': { icon: 'PenTool', color: '#ec4899' },
        'remote': { icon: 'Globe', color: '#6366f1' },
        'govt': { icon: 'Shield', color: '#0f172a' },
        'educat': { icon: 'BookOpen', color: '#f59e0b' }
    };

    const lowerName = this.name.toLowerCase();
    for (const [key, value] of Object.entries(iconMap)) {
        if (lowerName.includes(key)) {
            // Only auto-assign if the admin hasn't provided custom values
            if (this.icon === 'Briefcase' || !this.icon) this.icon = value.icon;
            if (this.color === '#2563eb' || !this.color) this.color = value.color;
            break;
        }
    }
    next();
});

// --- 3. VIRTUALS ---
CategorySchema.virtual('themeStyle').get(function() {
    return {
        background: this.group === 'job' ? 'rgba(37, 99, 235, 0.08)' : 'rgba(16, 185, 129, 0.08)',
        textColor: this.group === 'job' ? '#2563eb' : '#10b981',
        borderStyle: `1px solid ${this.group === 'job' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
    };
});

// Avoid "Model overwrite" error in development (localhost)
module.exports = mongoose.models.Category || mongoose.model('Category', CategorySchema);