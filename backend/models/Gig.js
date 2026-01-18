const GigSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  serviceName: { type: String, required: true },
  basePrice: { type: Number, required: true },
  deliveryTime: Number, // in days
  category: String, // e.g., "Web Development", "Graphic Design"
  isFeatured: { type: Boolean, default: false }
});