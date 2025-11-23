const Order = require("../models/Order");

// สำหรับผู้ขาย: ดูรายการที่ขายได้
exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // ดึง order ทั้งหมดที่มี items
    const orders = await Order.find({ "items.bookId": { $exists: true } })
      .populate("items.bookId", "title price userId images") // เอา userId ของผู้ขาย
      .populate("userId", "name email") // ข้อมูลผู้ซื้อ
      .lean();

    // filter เฉพาะ items ของ seller คนนี้
    const sellerOrders = orders.map(order => {
      const itemsForSeller = order.items.filter(item => {
        return item.bookId && item.bookId.userId.toString() === sellerId.toString();
      });

      if (itemsForSeller.length === 0) return null;

      return {
        _id: order._id,
        buyer: order.userId, // ข้อมูลผู้ซื้อ
        items: itemsForSeller,
        total: itemsForSeller.reduce((sum, i) => sum + i.price * i.quantity, 0),
        status: order.status,
        createdAt: order.createdAt,
      };
    }).filter(o => o !== null);

    res.json(sellerOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "ไม่สามารถดึงประวัติการขายได้" });
  }
};


// อัปเดตสถานะสินค้าใน order ของ seller
exports.updateOrderItemStatus = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { orderId, itemId } = req.params;
    const { status, trackingNumber } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order ไม่พบ" });

    const item = order.items.id(itemId);
    if (!item || item.sellerId.toString() !== sellerId.toString()) {
      return res.status(403).json({ message: "คุณไม่มีสิทธิแก้ไขสินค้านี้" });
    }

    if (status) item.status = status;
    if (trackingNumber) item.trackingNumber = trackingNumber;

    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};
