const Review = require('../models/Review');
const Order = require('../models/Order');

exports.create = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.buyerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
    const existing = await Review.findOne({ orderId });
    if (existing) return res.status(400).json({ message: 'Review already exists for this order' });
    const review = await Review.create({ orderId, rating, comment });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: 'Create review error', error: err.message });
  }
};
