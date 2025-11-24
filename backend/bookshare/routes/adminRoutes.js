const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');
const { updateBookStatus } = require('../controllers/bookController');
const { updateRole } = require('../controllers/adminController');

// อนุมัติ / ปฏิเสธหนังสือ
router.patch(
  '/seller-books/:id/status',
  authMiddleware,
  authorizeRoles('admin'), // ให้ admin เท่านั้น
  updateBookStatus
);
