const express = require("express");
const router = express.Router();
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");
const { payOrder } = require('../controllers/orderController');


router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: จัดการคำสั่งซื้อ (Buyer / Seller)
 */

// Buyer routes
/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: สร้างคำสั่งซื้อใหม่ (Buyer)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookId: { type: string }
 *               quantity: { type: number }
 *     responses:
 *       201:
 *         description: สร้างคำสั่งซื้อสำเร็จ
 */
router.post("/", authorizeRoles("buyer"), orderController.createOrder);
/**
 * @swagger
 * /api/orders/buyer:
 *   get:
 *     summary: ดูคำสั่งซื้อของตัวเอง (Buyer)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการคำสั่งซื้อของผู้ซื้อ
 */
router.get("/buyer", authorizeRoles("buyer"), orderController.getBuyerOrders);
router.patch("/:orderId/pay", authorizeRoles("buyer"), orderController.payOrder);

// Seller routes
/**
 * @swagger
 * /api/orders/seller:
 *   get:
 *     summary: ดูคำสั่งซื้อของตัวเอง (Seller)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการคำสั่งซื้อของผู้ขาย
 */
router.get("/seller", authorizeRoles("seller"), orderController.getSellerOrders);
/**
 * @swagger
 * /api/orders/{orderId}/ship:
 *   patch:
 *     summary: ส่งคำสั่งซื้อ (Seller)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID ของคำสั่งซื้อ
 *     responses:
 *       200:
 *         description: ส่งคำสั่งซื้อสำเร็จ
 */
router.patch("/:orderId/ship", authorizeRoles("seller"), orderController.shipOrder);

router.patch('/orders/:orderId/pay', authMiddleware, payOrder);


module.exports = router;
