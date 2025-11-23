const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['cod', 'bank', 'promptpay'], 
    default: 'promptpay' 
  },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'shipped', 'delivered'], 
    default: 'pending' 
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
