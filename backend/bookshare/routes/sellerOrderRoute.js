const express = require("express");
const router = express.Router();
const { getSellerOrders } = require("../controllers/orderController");
const authMiddleware = require("../middleware/auth");

// สำหรับผู้ขาย
router.get("/seller", authMiddleware, getSellerOrders);

module.exports = router;
