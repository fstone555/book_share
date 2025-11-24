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


// Seller: ดึงหนังสือของตัวเอง

/**
 * @swagger
 * /api/seller-books:
 *   get:
 *     summary: ดึงหนังสือของผู้ขาย (Seller/Admin)
 *     tags: [SellerBooks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการหนังสือ
 */
router.get("/", authorizeRoles("seller", "admin"), sellerBookController.getSellerBooks);


// Seller: ค้นหาหนังสือของตัวเอง

/**
 * @swagger
 * /api/seller-books/search/query:
 *   get:
 *     summary: ค้นหาหนังสือของผู้ขาย
 *     tags: [SellerBooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: คำค้นหา
 *     responses:
 *       200:
 *         description: รายการหนังสือที่ค้นหา
 */
router.get("/search/query", authorizeRoles("seller", "admin"), sellerBookController.searchSellerBooks);

// ------------------------
// Seller/Admin: ดึงหนังสือ 1 เล่ม
// ------------------------
/**
 * @swagger
 * /api/seller-books/{id}:
 *   get:
 *     summary: ดึงหนังสือ 1 เล่ม (Seller/Admin)
 *     tags: [SellerBooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID ของหนังสือ
 *     responses:
 *       200:
 *         description: รายละเอียดหนังสือ
 */
router.get("/:id", authorizeRoles("seller", "admin"), sellerBookController.getBookById);

/**
 * @swagger
 * /api/seller-books:
 *   post:
 *     summary: เพิ่มหนังสือใหม่ (รอ admin อนุมัติ)
 *     tags: [SellerBooks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: เพิ่มหนังสือสำเร็จ
 */
router.patch("/:id/status", authorizeRoles("admin"), sellerBookController.updateBookStatus);


// ------------------------
// Seller: เพิ่มหนังสือใหม่ (รอ admin อนุมัติ)
// ------------------------
router.post("/", authorizeRoles("seller"), upload.array("images", 10), sellerBookController.createBook);

// ------------------------
// Seller: แก้ไขหนังสือของตัวเอง
// ------------------------
/**
 * @swagger
 * /api/seller-books/{id}:
 *   put:
 *     summary: แก้ไขหนังสือของตัวเอง
 *     tags: [SellerBooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID ของหนังสือ
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: แก้ไขหนังสือสำเร็จ
 */
router.put("/:id", authorizeRoles("seller"), upload.array("images", 10), sellerBookController.updateBook);

// Seller: ลบหนังสือของตัวเอง
/**
 * @swagger
 * /api/seller-books/{id}:
 *   delete:
 *     summary: ลบหนังสือของตัวเอง
 *     tags: [SellerBooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID ของหนังสือ
 *     responses:
 *       200:
 *         description: ลบหนังสือสำเร็จ
 */
router.delete("/:id", authorizeRoles("seller"), sellerBookController.deleteBook);

// ------------------------
// Admin: อัปเดตสถานะหนังสือ (อนุมัติ/ปฏิเสธ)
// ------------------------
/**
 * @swagger
 * /api/seller-books/{id}/status:
 *   patch:
 *     summary: อัปเดตสถานะหนังสือ (อนุมัติ/ปฏิเสธ) Admin
 *     tags: [SellerBooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string }
 *     responses:
 *       200:
 *         description: อัปเดตสถานะสำเร็จ
 */
router.patch("/:id/status", authorizeRoles("admin"), sellerBookController.updateBookStatus);

// ------------------------
// Admin: ดูหนังสือที่รออนุมัติ
// ------------------------
/**
 * @swagger
 * /api/seller-books/pending/list:
 *   get:
 *     summary: ดูหนังสือที่รออนุมัติ (Admin)
 *     tags: [SellerBooks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการหนังสือรออนุมัติ
 */
router.get("/pending/list", authorizeRoles("admin"), sellerBookController.listPendingBooks);




module.exports = router;

