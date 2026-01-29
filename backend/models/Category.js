const mongoose = require('mongoose');

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
    // Icon name from Lucide library (e.g., 'Code', 'Monitor', 'Briefcase')
    icon: { 
        type: String, 
        default: 'Briefcase' 
    }, 
    color: { 
        type: String, 
        default: '#2563eb' 
    },
    
    // Sort Order: Higher priority numbers appear first in the UI
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
 * Composite unique index: Allows "Development" to exist in both groups,
 * but prevents duplicate "Development" entries within the same group.
 */
CategorySchema.index({ name: 1, group: 1 }, { unique: true });
CategorySchema.index({ slug: 1, group: 1 }, { unique: true });

// --- 2. MIDDLEWARE: SLUG & AUTO-THEMING ---

CategorySchema.pre('validate', function(next) {
    // URL-Friendly Slug Generation
    if (this.isModified('name') && this.name) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')     // Remove non-alphanumeric
            .replace(/[\s_-]+/g, '-')     // Replace spaces/underscores with hyphens
            .replace(/^-+|-+$/g, '');     // Trim leading/trailing hyphens
    }

    // Smart Icon & Color Mapping logic
    if (this.isNew || this.isModified('name')) {
        const iconMap = {
            'code': { icon: 'Code', color: '#2563eb' },
            'dev': { icon: 'Cpu', color: '#2563eb' },
            'design': { icon: 'Palette', color: '#d946ef' },
            'ui': { icon: 'Layout', color: '#d946ef' },
            'market': { icon: 'Megaphone', color: '#f59e0b' },
            'finance': { icon: 'DollarSign', color: '#10b981' },
            'crypto': { icon: 'Zap', color: '#10b981' },
            'remote': { icon: 'Globe', color: '#6366f1' },
            'content': { icon: 'PenTool', color: '#ec4899' },
            'data': { icon: 'BarChart3', color: '#3b82f6' }
        };
        
        const lowerName = this.name.toLowerCase();
        for (const [key, value] of Object.entries(iconMap)) {
            if (lowerName.includes(key)) {
                // Only override if it's currently the default
                if (this.icon === 'Briefcase') this.icon = value.icon;
                if (this.color === '#2563eb') this.color = value.color;
                break;
            }
        }
    }
    next();
});

// --- 3. VIRTUALS ---
// Virtual property for frontend styling logic
CategorySchema.virtual('isHighPriority').get(function() {
    return this.priority >= 10;
});

CategorySchema.virtual('themeStyle').get(function() {
    return {
        background: this.group === 'job' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(16, 185, 129, 0.1)',
        textColor: this.group === 'job' ? '#2563eb' : '#10b981'
    };
});

module.exports = mongoose.model('Category', CategorySchema);