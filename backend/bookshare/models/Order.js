const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  bookId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Book', 
    required: [true, 'Book ID is required'] 
  },
  quantity: { 
    type: Number, 
    default: 1,
    min: [1, 'Quantity must be at least 1']
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  sellerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Seller ID is required'] 
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'User ID is required']
  },
  
  name: { 
    type: String, 
    required: [true, 'Name is required'] 
  },

  address: { 
    type: String, 
    required: [true, 'Address is required'] 
  },

  phone: { 
    type: String, 
    required: [true, 'Phone number is required'] 
  },

  paymentMethod: {
    type: String,
    enum: ['cod', 'bank', 'promptpay'],
    default: 'promptpay'
  },

  items: {
    type: [orderItemSchema],
    validate: [
      val => val.length > 0,
      'Order must have at least 1 item'
    ]
  },

  total: { 
    type: Number, 
    required: [true, 'Order total is required'],
    min: [0, 'Total must be positive']
  },

  trackingNumber: { 
    type: String, 
    default: null 
  },

  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'delivered'],
    default: 'pending'
  }

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
