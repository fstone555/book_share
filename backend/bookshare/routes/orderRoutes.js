const express = require("express");
const router = express.Router();
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");

router.use(authMiddleware);

// Buyer routes
router.post("/", authorizeRoles("buyer"), orderController.createOrder);
router.get("/buyer", authorizeRoles("buyer"), orderController.getBuyerOrders);
router.patch("/:orderId/pay", authorizeRoles("buyer"), orderController.payOrder);

// Seller routes
router.get("/seller", authorizeRoles("seller"), orderController.getSellerOrders);
router.patch("/:orderId/ship", authorizeRoles("seller"), orderController.shipOrder);

module.exports = router;
