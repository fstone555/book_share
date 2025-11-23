const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');
const { getOrdersBySeller } = require('../controllers/orderController');

// สร้างคำสั่งซื้อ
router.post('/', authMiddleware, orderController.createOrder);

// ดึงคำสั่งซื้อของผู้ใช้
router.get('/my', authMiddleware, orderController.getUserOrders);

// ดึงคำสั่งซื้อทั้งหมด (admin)
router.get('/', authMiddleware, authorizeRoles('admin'), orderController.getAllOrders);

// อัปเดตสถานะคำสั่งซื้อ (admin)
router.patch('/:id/status', authMiddleware, authorizeRoles('admin'), orderController.updateOrderStatus);

// ดึงคำสั่งซื้อของ seller
router.get('/seller', authMiddleware, getOrdersBySeller); // query: ?sellerId=...

module.exports = router;
