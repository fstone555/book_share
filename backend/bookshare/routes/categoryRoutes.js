// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

// ดึงหมวดหมู่ทั้งหมด
/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: ดึงหมวดหมู่ทั้งหมด
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: รายการหมวดหมู่
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 */
router.get('/', categoryController.list);

// เพิ่มหมวดหมู่ (admin เท่านั้น)
/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: เพิ่มหมวดหมู่ใหม่ (Admin เท่านั้น)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: เพิ่มหมวดหมู่สำเร็จ
 *       401:
 *         description: Unauthorized / Token ไม่ถูกต้อง
 *       403:
 *         description: Forbidden / ไม่ใช่ admin
 */
router.post('/', authMiddleware, authorizeRoles('admin'), categoryController.create);

module.exports = router; // ✅ ต้อง export router
