const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true }, // ราคาต่อหน่วย
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },          // ชื่อผู้รับ
  address: { type: String, required: true },       // ที่อยู่จัดส่ง
  paymentMethod: { type: String, enum: ['cod', 'bank'], default: 'cod' },
  items: [orderItemSchema],                        // รายการหนังสือ
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'shipped', 'delivered'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
