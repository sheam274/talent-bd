const mongoose = require('mongoose');

/**
 * GIG SCHEMA: Optimized for Talent-BD Marketplace Sync
 * Connected to Admin Category Management for dynamic filtering.
 */
const GigSchema = new mongoose.Schema({
    seller: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: [true, 'A seller is required for this gig']
    },
    serviceName: { 
        type: String, 
        required: [true, 'Service name is required'],
        trim: true,
        index: true 
    },
    description: {
        type: String,
        required: [true, 'Please provide a description of your service'],
        maxLength: [1000, 'Description cannot exceed 1000 characters']
    },
    basePrice: { 
        type: Number, 
        required: [true, 'Base price is required'],
        min: [5, 'Minimum gig price is $5'] 
    },
    deliveryTime: { 
        type: Number, 
        required: true // Days to deliver
    },
    /**
     * DYNAMIC CATEGORY SYNC:
     * We use a String for the category name to ensure the UI is responsive.
     * The Admin adds these categories via the Category Manager (group: 'job').
     */
    category: { 
        type: String, 
        required: true,
        default: 'General Service',
        index: true
    },
    categoryRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category' // Links to the Admin-managed Category
    },
    tags: [String], 
    isFeatured: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['Active', 'Paused', 'Draft'],
        default: 'Active'
    },
    rating: { type: Number, default: 5.0, min: 0, max: 5 },
    totalSales: { type: Number, default: 0 }
}, { 
    timestamps: true 
});

// RESPONSIVE SEARCH INDEX
// Allows users to filter by category and price range instantly on mobile
GigSchema.index({ category: 1, basePrice: 1, serviceName: 'text' });

module.exports = mongoose.model('Gig', GigSchema);