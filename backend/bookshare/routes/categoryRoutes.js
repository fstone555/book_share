// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

// ดึงหมวดหมู่ทั้งหมด
router.get('/', categoryController.list);

// เพิ่มหมวดหมู่ (admin เท่านั้น)
router.post('/', authMiddleware, authorizeRoles('admin'), categoryController.create);

module.exports = router; // ✅ ต้อง export router
