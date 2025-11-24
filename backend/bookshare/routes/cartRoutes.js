// routes/cart.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart'); // สมมติมี schema cart

// ดึงตะกร้าของผู้ใช้
/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: ดึงตะกร้าของผู้ใช้
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการหนังสือในตะกร้า
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   bookId:
 *                     type: string
 *                   quantity:
 *                     type: number
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.bookId');
    res.json(cart ? cart.items : []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// เพิ่มหนังสือ
/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: เพิ่มหนังสือลงตะกร้า
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: รายการหนังสือในตะกร้าหลังเพิ่ม
 *       500:
 *         description: Internal server error
 */
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
/**
 * @swagger
 * /api/cart/{bookId}:
 *   delete:
 *     summary: ลบหนังสือออกจากตะกร้า
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID ของหนังสือ
 *     responses:
 *       200:
 *         description: รายการหนังสือในตะกร้าหลังลบ
 *       404:
 *         description: ตะกร้าไม่พบ
 *       500:
 *         description: Internal server error
 */
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
