const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { getMyNotifications, markAsRead } = require("../controllers/notificationController");

// ใช้ authMiddleware ทุก route
router.use(authMiddleware);

// ดึง notifications ของตัวเอง
router.get("/my", getMyNotifications);

// ทำเครื่องหมายว่าอ่านแล้ว
router.patch("/:id/read", markAsRead);

module.exports = router;
