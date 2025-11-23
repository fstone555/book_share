const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Public
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/reset-password', userController.resetPassword);

// Protected
router.get('/profile', authMiddleware, userController.getProfile);
router.patch('/profile', authMiddleware, upload.single('avatar'), userController.updateProfile);

// Admin only
router.get('/', authMiddleware, authorizeRoles('admin'), userController.getUsers);

module.exports = router;
