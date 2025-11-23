const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { updateRole } = require('../controllers/adminController');

router.put('/users/:id/role', authenticate, authorizeRoles('admin'), updateRole);

module.exports = router;
