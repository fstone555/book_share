// const express = require('express');
// const router = express.Router();
// const bookController = require('../controllers/bookController');
// const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
// const upload = require('../middleware/uploadMiddleware');

// router.get('/', bookController.list);
// router.get('/:id', bookController.get);

// // Protected
// router.post('/', authenticate, authorizeRoles('seller','admin'), upload.single('image'), bookController.create);
// router.put('/:id', authenticate, upload.single('image'), bookController.update);
// router.delete('/:id', authenticate, bookController.remove);

// module.exports = router;
