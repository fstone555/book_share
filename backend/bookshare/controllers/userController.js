const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(
  "1010504574950-qs95p0bsb96ga96ahfjehco0khucgv19.apps.googleusercontent.com"
);


// ---------------------------
// Google Login
// ---------------------------
exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'idToken is required' });

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // สร้างบัญชีใหม่ถ้าไม่มี
      user = await User.create({
        name,
        email,
        password: null, // ไม่ต้องใช้ password สำหรับ Google
        googleId,
        role: 'buyer', // กำหนด role default
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'change_this_secret',
      { expiresIn: '7d' }
    );

    res.json({ message: 'Login with Google successful', token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Google login error', error: err.message });
  }
};

// ---------------------------
// Register
// ---------------------------
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email, and password are required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'buyer'
    });

    const { password: _, ...userData } = user.toObject();
    res.status(201).json({ message: 'User registered', user: userData });
  } catch (err) {
    res.status(500).json({ message: 'Register error', error: err.message });
  }
};

// ---------------------------
// Login
// ---------------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'change_this_secret',
      { expiresIn: '7d' }
    );

    const { password: _, ...userData } = user.toObject();
    res.json({ message: 'Login successful', token, user: userData });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
};

// ---------------------------
// Get Profile
// ---------------------------
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Get profile error', error: err.message });
  }
};


// ---------------------------
// Admin: Get all users
// ---------------------------
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Get users error', error: err.message });
  }
};

// ---------------------------
// Reset Password
// ---------------------------
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return res.status(400).json({ message: 'Email and newPassword are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: `User with email ${email} not found` });

    user.password = newPassword; // pre-save hook จะ hash ให้
    await user.save();

    res.json({ message: `Password for ${email} has been reset` });
  } catch (err) {
    res.status(500).json({ message: 'Reset password error', error: err.message });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password; // pre-save hook จะ hash ให้
    if (phone) user.phone = phone;
    if (address) user.address = address;

    // อัปโหลด avatar
    if (req.file) {
      // ลบไฟล์เก่า
      if (user.avatar) {
        const oldPath = path.join(__dirname, '..', user.avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      // เปลี่ยนชื่อไฟล์เป็น timestamp + originalname
      const ext = path.extname(req.file.originalname);
      const newFilename = `uploads/${Date.now()}-${req.file.originalname}`;
      fs.renameSync(req.file.path, path.join(__dirname, '..', newFilename));
      user.avatar = newFilename.replace(/\\/g, '/');
    }

    await user.save();
    const { password: _, ...userData } = user.toObject();
    res.json({ message: 'Profile updated', user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update profile error', error: err.message });
  }
};