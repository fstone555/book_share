const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');
const multer = require('multer');

// Multer config เก็บไฟล์ใน uploads/ และตั้งชื่อไฟล์ไม่ซ้ำ
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ---------------------------
// Public routes
// ---------------------------
router.post('/register', userController.register);
router.post('/login', userController.login);          // login ปกติ
router.post('/google-login', userController.googleLogin); // login ด้วย Google
router.post('/reset-password', userController.resetPassword);

// ---------------------------
// Protected routes
// ---------------------------
router.get('/profile', authMiddleware, userController.getProfile);
router.patch(
  '/profile',
  authMiddleware,
  upload.single('avatar'), // อัปโหลดรูปโปรไฟล์
  userController.updateProfile
);

// ---------------------------
// Admin only routes
// ---------------------------
router.get('/', authMiddleware, authorizeRoles('admin'), userController.getUsers);

module.exports = router;
