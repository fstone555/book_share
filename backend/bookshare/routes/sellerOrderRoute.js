const express = require("express");
const router = express.Router();
const { getSellerOrders } = require("../controllers/orderController");
const authMiddleware = require("../middleware/auth");

// สำหรับผู้ขาย
/**
 * @swagger
 * /api/orders/seller:
 *   get:
 *     summary: ดึงคำสั่งซื้อของผู้ขาย
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการคำสั่งซื้อของผู้ขาย
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   orderId:
 *                     type: string
 *                   buyerName:
 *                     type: string
 *                   totalPrice:
 *                     type: number
 *                   status:
 *                     type: string
 *       401:
 *         description: Unauthorized / Token ไม่ถูกต้อง
 */
router.get("/seller", authMiddleware, getSellerOrders);

module.exports = router;
