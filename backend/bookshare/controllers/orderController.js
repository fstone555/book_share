const Order = require('../models/Order');
const Book = require('../models/Book');

// สร้างคำสั่งซื้อ
exports.createOrder = async (req, res) => {
  try {
    const { name, address, paymentMethod, items } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    let total = 0;
    const orderItems = await Promise.all(items.map(async i => {
      const book = await Book.findById(i.bookId);
      if (!book) throw new Error(`Book not found: ${i.bookId}`);
      total += book.price * i.quantity;
      return { bookId: book._id, quantity: i.quantity, price: book.price };
    }));

    const order = await Order.create({
      userId: req.user._id,
      name,
      address,
      paymentMethod,
      items: orderItems,
      total
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Create order error', error: err.message });
  }
};

// ดึง order ของผู้ใช้
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).populate('items.bookId');
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Get user orders error', error: err.message });
  }
};

// ดึง order ทั้งหมด (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email').populate('items.bookId');
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Get all orders error', error: err.message });
  }
};

// อัปเดต status (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const { status } = req.body;
    if (!['pending','paid','shipped','delivered'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update order status error', error: err.message });
  }
};


// ดึง order ทั้งหมดของ seller
exports.getOrdersBySeller = async (req, res) => {
  try {
    const { sellerId } = req.query;
    if (!sellerId) return res.status(400).json({ message: 'sellerId required' });

    const orders = await Order.find({ 'items.bookId': { $exists: true } })
      .populate('userId', 'name')
      .populate('items.bookId');

    // filter เฉพาะ item ของ seller นี้
    const filteredOrders = orders.map(order => {
      const items = order.items.filter(item => item.bookId.userId.toString() === sellerId);
      return { ...order.toObject(), items };
    }).filter(order => order.items.length > 0);

    res.json(filteredOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Cannot fetch orders', error: err.message });
  }
};