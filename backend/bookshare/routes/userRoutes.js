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
/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: ลงทะเบียนผู้ใช้ใหม่
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string }
 *     responses:
 *       201: { description: ลงทะเบียนสำเร็จ }
 *       400: { description: ข้อมูลไม่ครบหรืออีเมลซ้ำ }
 */
router.post('/register', userController.register);
/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: เข้าสู่ระบบ
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: เข้าสู่ระบบสำเร็จ }
 *       400: { description: อีเมลหรือรหัสผ่านไม่ถูกต้อง }
 */
router.post('/login', userController.login); // login ปกติ
router.post('/reset-password', userController.resetPassword);

// ---------------------------
// Protected routes
// ---------------------------
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: ดูข้อมูลผู้ใช้ปัจจุบัน
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: ข้อมูลผู้ใช้ }
 *       401: { description: Unauthorized }
 *
 *   patch:
 *     summary: อัปเดตข้อมูลผู้ใช้รวม avatar
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *               avatar: { type: string, format: binary }
 *     responses:
 *       200: { description: อัปเดตสำเร็จ }
 *       401: { description: Unauthorized }
 */
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
