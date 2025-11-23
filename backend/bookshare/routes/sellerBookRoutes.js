const express = require("express");
const router = express.Router();
const sellerBookController = require("../controllers/sellerBookController");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// ตั้งค่า upload รูป
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/books/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Middleware สำหรับ router ทั้งหมด
router.use(authMiddleware);

// ------------------------
// Seller: ดึงหนังสือของตัวเอง
// ------------------------
router.get("/", authorizeRoles("seller", "admin"), sellerBookController.getSellerBooks);

// ------------------------
// Seller: ค้นหาหนังสือของตัวเอง
// ------------------------
router.get("/search/query", authorizeRoles("seller", "admin"), sellerBookController.searchSellerBooks);

// ------------------------
// Seller/Admin: ดึงหนังสือ 1 เล่ม
// ------------------------
router.get("/:id", authorizeRoles("seller", "admin"), sellerBookController.getBookById);

router.patch("/:id/status", authorizeRoles("admin"), sellerBookController.updateBookStatus);


// ------------------------
// Seller: เพิ่มหนังสือใหม่ (รอ admin อนุมัติ)
// ------------------------
router.post("/", authorizeRoles("seller"), upload.array("images", 10), sellerBookController.createBook);

// ------------------------
// Seller: แก้ไขหนังสือของตัวเอง
// ------------------------
router.put("/:id", authorizeRoles("seller"), upload.array("images", 10), sellerBookController.updateBook);

// ------------------------
// Seller: ลบหนังสือของตัวเอง
// ------------------------
router.delete("/:id", authorizeRoles("seller"), sellerBookController.deleteBook);

// ------------------------
// Admin: อัปเดตสถานะหนังสือ (อนุมัติ/ปฏิเสธ)
// ------------------------
router.patch("/:id/status", authorizeRoles("admin"), sellerBookController.updateBookStatus);

// ------------------------
// Admin: ดูหนังสือที่รออนุมัติ
// ------------------------
router.get("/pending/list", authorizeRoles("admin"), sellerBookController.listPendingBooks);




module.exports = router;

