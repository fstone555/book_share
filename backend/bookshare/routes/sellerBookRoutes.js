const express = require("express");
const router = express.Router();
const sellerBookController = require("../controllers/sellerBookController");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// ตั้งค่า multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/books/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ทุก endpoint ต้องเป็น seller
router.use(authMiddleware, authorizeRoles("seller", "admin"));

router.get("/", sellerBookController.getSellerBooks);
router.get("/search/query", sellerBookController.searchSellerBooks);
router.get("/:id", sellerBookController.getBookById);
router.post("/", upload.array("images", 10), sellerBookController.createBook);
router.put("/:id", upload.array("images", 10), sellerBookController.updateBook); // <-- ใช้ put
router.delete("/:id", sellerBookController.deleteBook);
router.patch("/:id/status", sellerBookController.updateBookStatus);

module.exports = router;
