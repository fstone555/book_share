const Order = require("../models/Order");
const Book = require("../models/Book");

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
    const orders = await Order.find({ "items.bookId": { $exists: true } })
      .populate("items.bookId", "title userId")
      .populate("userId", "name email")
      .lean();

    const sellerOrders = orders.map(order => {
      const itemsForSeller = order.items.filter(item => item.bookId && item.bookId.userId.toString() === sellerId.toString());
      return {
        _id: order._id,
        buyer: order.userId,
        total: itemsForSeller.reduce((sum, i) => sum + i.price * i.quantity, 0),
        items: itemsForSeller,
        status: order.status,
        createdAt: order.createdAt,
      };
    }).filter(o => o.items.length > 0);

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

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "ไม่มีรายการสินค้า" });
    }

    // คำนวณราคารวม
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // สร้างคำสั่งซื้อ
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

    // อัปเดตสถานะหนังสือเป็นขายแล้ว
    await Promise.all(
      items.map(item =>
        Book.findByIdAndUpdate(item.bookId, { isSold: true })
      )
    );

    res.status(201).json(order);

  } catch (err) {
    console.error("สร้าง Order ผิดพลาด:", err);
    res.status(500).json({ message: "ไม่สามารถสร้างคำสั่งซื้อได้", error: err.message });
  }
};
