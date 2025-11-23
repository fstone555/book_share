const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change_this_secret');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalid', error: err.message });
  }
};

/**
 * authorizeRoles: ตรวจ role ไม่สนใจตัวพิมพ์ และ log debug
 * ใช้ได้แบบ:
 * router.patch("/some-route", authorizeRoles("admin"), controller)
 */
exports.authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    console.log("No user in request");
    return res.status(403).json({ message: 'Forbidden: No user' });
  }

  const userRole = req.user.role?.toLowerCase();
  const allowedRoles = roles.map(r => r.toLowerCase());

  console.log("User role:", userRole, "Allowed roles:", allowedRoles);

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ message: 'Forbidden: Insufficient role' });
  }

  next();
};
