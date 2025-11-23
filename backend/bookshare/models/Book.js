const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  price: { type: Number, default: 0 },
  condition: { type: String, enum: ['new', 'used', 'used-like-new'], default: 'used' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shortDescription: { type: String, default: '' },
  images: [String],
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  isSold: { type: Boolean, default: false }  // false = ยังขายได้, true = ขายแล้ว
}, { timestamps: true });

bookSchema.virtual('image_url').get(function() {
  return this.images && this.images.length > 0 ? this.images[0] : null;
});

bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Book', bookSchema);
