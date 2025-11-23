const express = require("express");
const router = express.Router();
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");

router.use(authMiddleware);

// สร้าง order
router.post("/", authorizeRoles("buyer"), orderController.createOrder);

// ดูประวัติผู้ซื้อ
router.get("/buyer", authorizeRoles("buyer"), orderController.getBuyerOrders);

// ดูประวัติผู้ขาย
router.get("/seller", authorizeRoles("seller"), orderController.getSellerOrders);


// จ่ายเงินจำลอง
router.patch("/:orderId/pay", authorizeRoles("buyer"), async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order ไม่พบ" });

    // ตรวจสอบเจ้าของ order
    if (order.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "ไม่อนุญาต" });

    order.status = "paid"; // จ่ายสำเร็จ
    await order.save();

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "ไม่สามารถอัปเดตสถานะได้" });
  }
});


module.exports = router;


