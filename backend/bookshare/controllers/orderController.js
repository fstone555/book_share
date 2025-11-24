const Order = require("../models/Order");
const Book = require("../models/Book");
const User = require("../models/User"); // สำหรับ notifyUser

// ----------------------------
// สำหรับผู้ซื้อ: ดูประวัติการสั่งซื้อ
// ----------------------------
exports.getBuyerOrders = async (req, res) => {
  try {
    const buyerId = req.user._id;
    const orders = await Order.find({ userId: buyerId })
      .populate("items.bookId", "title price images")
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "ไม่สามารถดึงประวัติการซื้อได้" });
  }
};

// ----------------------------
// สำหรับผู้ขาย: ดูรายการที่ขายได้
// ----------------------------
exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const orders = await Order.find({ "items.sellerId": sellerId })
      .populate("userId", "email") 
      .populate("items.bookId", "title price images")
      .sort({ createdAt: -1 })
      .lean();

    const sellerOrders = orders.map(order => {
      const myItems = order.items.filter(
        item => item.sellerId.toString() === sellerId.toString()
      );

      if (myItems.length === 0) return null;

      return {
        _id: order._id,
        buyer: {
          name: order.name,
          address: order.address,
          phone: order.phone,
          email: order.userId?.email || ""
        },
        items: myItems,
        total: myItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
        status: order.status,
        createdAt: order.createdAt
      };
    }).filter(o => o !== null);

    res.json(sellerOrders);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "ไม่สามารถดึงประวัติการขายได้" });
  }
};

// ----------------------------
// สร้างคำสั่งซื้อใหม่
// ----------------------------
exports.createOrder = async (req, res) => {
  try {
    const buyerId = req.user?._id;
    if (!buyerId) return res.status(401).json({ message: "คุณต้องล็อกอิน" });

    const { name, address, phone, paymentMethod, items } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ message: "ไม่มีรายการสินค้า" });

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      userId: buyerId,
      name,
      address,
      phone,
      paymentMethod,
      items,
      total,
      status: "pending",
    });

    await Promise.all(items.map(item =>
      Book.findByIdAndUpdate(item.bookId, { isSold: true })
    ));

    res.status(201).json(order);

  } catch (err) {
    console.error("สร้าง Order ผิดพลาด:", err);
    res.status(500).json({ message: "ไม่สามารถสร้างคำสั่งซื้อได้", error: err.message });
  }
};

// ----------------------------
// จ่ายเงิน (จำลอง)
// ----------------------------
exports.payOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // หา order
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // ตรวจ user
    if (order.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Unauthorized: not your order' });

    // ตรวจ status
    if (order.status !== 'pending')
      return res.status(400).json({ message: `Cannot pay an order with status ${order.status}` });

    // อัปเดตสถานะ
    order.status = 'paid';
    await order.save();

    res.json({ message: 'Payment successful', order });
  } catch (err) {
    console.error('payOrder error:', err);
    res.status(500).json({ message: 'Payment failed', error: err.message });
  }
};




// ----------------------------
// จัดส่งสินค้า
// ----------------------------
exports.shipOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { trackingNumber } = req.body;

    if (!trackingNumber) return res.status(400).json({ message: "ต้องระบุ trackingNumber" });

    const order = await Order.findById(orderId).populate("userId");
    if (!order) return res.status(404).json({ message: "Order ไม่พบ" });

    const sellerOwnsItem = order.items.some(
      item => item.sellerId.toString() === req.user._id.toString()
    );
    if (!sellerOwnsItem) return res.status(403).json({ message: "คุณไม่มีสิทธิ์จัดส่งออเดอร์นี้" });

    order.status = "shipped";
    order.trackingNumber = trackingNumber;
    await order.save();

    // ส่งแจ้งเตือนผู้ซื้อ (ตัวอย่าง)
    await notifyUser(order.userId._id, trackingNumber);

    res.json({ message: "อัปเดตสถานะแล้ว", order });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "ไม่สามารถอัปเดตสถานะได้" });
  }
};

// ----------------------------
// ฟังก์ชันตัวอย่างแจ้งผู้ซื้อ
// ----------------------------
async function notifyUser(userId, trackingNumber) {
  const user = await User.findById(userId);
  if (!user) return;
  console.log(`แจ้งผู้ซื้อ ${user.email} Tracking Number: ${trackingNumber}`);
  // สามารถส่ง Email / Line Notify / Push Notification แทน console.log
}


// =======================
// Buyer: ชำระเงิน
// =======================
exports.payOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // หา order
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // ตรวจสอบว่าเป็นผู้ซื้อของ order นี้
    if (order.buyer.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized to pay this order" });

    // ตรวจสอบสถานะเดิม
    if (order.status !== "pending")
      return res.status(400).json({ message: `Order status is ${order.status}, cannot pay` });

    // อัปเดตสถานะเป็น paid
    order.status = "paid";
    order.paidAt = new Date();
    await order.save();

    res.json({ message: "Payment successful", order });
  } catch (err) {
    console.error("Pay order error:", err);
    res.status(500).json({ message: "Pay order error", error: err.message });
  }
};

