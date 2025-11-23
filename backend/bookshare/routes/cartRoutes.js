// routes/cart.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart'); // สมมติมี schema cart

// ดึงตะกร้าของผู้ใช้
router.get('/', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.bookId');
    res.json(cart ? cart.items : []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// เพิ่มหนังสือ
router.post('/add', async (req, res) => {
  const { bookId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }
    const existing = cart.items.find(i => i.bookId.toString() === bookId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ bookId, quantity });
    }
    await cart.save();
    res.json(cart.items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ลบหนังสือ
router.delete('/:bookId', async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = cart.items.filter(i => i.bookId.toString() !== req.params.bookId);
    await cart.save();
    res.json(cart.items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
