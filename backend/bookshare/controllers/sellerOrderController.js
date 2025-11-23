// controllers/orderController.js
const Order = require("../models/Order");

exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // ดึง order ทั้งหมดที่มี items ของ seller คนนี้
    const orders = await Order.find({ "items.sellerId": sellerId }).lean();

    const sellerOrders = orders.map(order => {
      const itemsForSeller = order.items.filter(
        item => item.sellerId.toString() === sellerId.toString()
      );
      if (itemsForSeller.length === 0) return null;

      return {
        _id: order._id,
        buyer: {
          name: order.name,        // จาก order document
          address: order.address,  // จาก order document
          phone: order.phone,      // จาก order document
          email: order.userId.email // ถ้าอยากเอา email
        },
        items: itemsForSeller,
        total: itemsForSeller.reduce((sum, i) => sum + i.price * i.quantity, 0),
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
