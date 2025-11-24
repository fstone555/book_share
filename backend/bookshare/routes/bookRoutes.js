const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authMiddleware } = require('../middleware/authMiddleware');
const sellerBookController = require('../controllers/sellerBookController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_DIR || 'uploads'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });


// ดึงหนังสือทั้งหมด (ต้องอยู่ก่อน /:id)
router.get('/all', bookController.listAll);

// ดึงรายการหนังสือ (รองรับ sellerId query)
router.get('/', bookController.list);

// ดึงหนังสือเดียว
router.get('/:id', bookController.get);


// ดึงของ seller เอง
router.get('/seller', authMiddleware, sellerBookController.getSellerBooks);



module.exports = router;
