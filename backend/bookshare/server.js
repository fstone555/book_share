require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt'); // ✅ สำหรับ hash password
const connectDB = require('./config/db');
const User = require('./models/User');

const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const sellerBookRoutes = require('./routes/sellerBookRoutes');
const sellerRoutes = require("./routes/seller");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/' + (process.env.UPLOAD_DIR || 'uploads'), express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);

// Seller routes
app.use("/api/seller", sellerRoutes); // profile, dashboard, sales-history
app.use("/api/seller/books", sellerBookRoutes); // หนังสือของ seller

// สร้าง admin ถ้าไม่มี
const createAdminIfNotExists = async () => {
  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin123', 10); // ✅ hash password
    await User.create({
      name: 'Admin',
      email: 'admin@bookshare.com',
      password: hashedPassword,
      role: 'admin'
    });
    console.log('Admin user created: admin@bookshare.com / admin123');
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await createAdminIfNotExists();
    app.listen(PORT, () => console.log('Server running on port', PORT));
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
