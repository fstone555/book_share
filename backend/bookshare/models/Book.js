// models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  price: { type: Number, default: 0 },
  condition: { type: String, enum: ['new', 'used'], default: 'used' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shortDescription: { type: String, default: '' },
  images: [String],
  status: { type: String, default: 'active' }
}, { timestamps: true });

// Virtual field สำหรับภาพแรก
bookSchema.virtual('image_url').get(function() {
  return this.images && this.images.length > 0 ? this.images[0] : null;
});

// ให้ virtual field แสดงเมื่อแปลงเป็น JSON / Object
bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Book', bookSchema);
