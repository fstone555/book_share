// routes/sellerDashboardRoutes.js
const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getSalesHistory,
  getProfile,
  updateProfile,
} = require("../controllers/sellerDashboardController");

const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

// ต้องเป็น seller เท่านั้น
router.use(authMiddleware, authorizeRoles("seller", "admin"));

router.get("/stats", getDashboardStats);
router.get("/sales", getSalesHistory);
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);

module.exports = router;
