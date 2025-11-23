const express = require("express");
const router = express.Router();
const sellerController = require("../controllers/sellerDashboardController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Profile
router.get("/profile", authMiddleware, sellerController.getProfile);
router.put("/profile", authMiddleware, sellerController.updateProfile);

// Dashboard
router.get("/dashboard", authMiddleware, sellerController.getDashboardStats);
router.get("/sales-history", authMiddleware, sellerController.getSalesHistory);

module.exports = router;
