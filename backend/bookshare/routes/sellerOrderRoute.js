const express = require("express");
const router = express.Router();
const sellerOrderController = require("../controllers/sellerOrderController");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

router.use(authMiddleware, authorizeRoles("seller"));

// ดึง order ของ seller
router.get("/orders", sellerOrderController.getSellerOrders);

// อัปเดตสถานะสินค้า
router.patch("/orders/:orderId/items/:itemId", sellerOrderController.updateOrderItemStatus);

module.exports = router;
