const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { getMyNotifications, markAsRead } = require("../controllers/notificationController");

// ใช้ authMiddleware ทุก route
router.use(authMiddleware);

// ดึง notifications ของตัวเอง
/**
 * @swagger
 * /api/notifications/my:
 *   get:
 *     summary: ดึง notifications ของตัวเอง
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการ notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   message:
 *                     type: string
 *                   isRead:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.get("/my", getMyNotifications);

// ทำเครื่องหมายว่าอ่านแล้ว
/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: ทำเครื่องหมายว่า notification อ่านแล้ว
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID ของ notification
 *     responses:
 *       200:
 *         description: ทำเครื่องหมายว่าอ่านแล้วสำเร็จ
 */
router.patch("/:id/read", markAsRead);

module.exports = router;
