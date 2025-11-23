// controllers/sellerDashboardController.js
const Book = require("../models/Book");
const Order = require("../models/Order");
const User = require("../models/User");

// ---------------------------
// ดึงข้อมูล Dashboard ของผู้ขาย
// ---------------------------
exports.getDashboardStats = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const totalBooks = await Book.countDocuments({ userId: sellerId });
    const soldBooks = await Order.countDocuments({
      sellerId,
      status: "success",
    });
    const pendingOrders = await Order.countDocuments({
      sellerId,
      status: "pending",
    });

    const revenueResult = await Order.aggregate([
      { $match: { sellerId, status: "success" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const totalRevenue = revenueResult.length ? revenueResult[0].total : 0;

    const user = await User.findById(sellerId);

    res.json({
      totalBooks,
      soldBooks,
      pendingOrders,
      totalRevenue,
      memberSince: user.createdAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Cannot fetch dashboard stats" });
  }
};

// ---------------------------
// ดึงประวัติการขายของผู้ขาย
// ---------------------------
exports.getSalesHistory = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const orders = await Order.find({ sellerId })
      .populate("bookId", "title price")
      .sort({ createdAt: -1 });

    const formatted = orders.map((order) => ({
      id: order._id,
      bookTitle: order.bookId?.title,
      quantity: order.quantity,
      price: order.bookId?.price,
      date: order.createdAt.toISOString().split("T")[0],
      status:
        order.status === "success"
          ? "สำเร็จ"
          : order.status === "pending"
          ? "รอดำเนินการ"
          : "ยกเลิก",
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Cannot fetch sales history" });
  }
};

// ---------------------------
// อัปเดตข้อมูลส่วนตัวผู้ขาย
// ---------------------------
exports.updateProfile = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const { fullName, email, phone, address, newPassword } = req.body;

    const user = await User.findById(sellerId);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    if (newPassword && newPassword.length >= 6) {
      user.password = newPassword; // bcrypt ใน pre("save")
    }

    await user.save();

    res.json({ message: "Profile updated", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Cannot update profile" });
  }
};

// ---------------------------
// ดึงข้อมูลโปรไฟล์ผู้ขาย
// ---------------------------
exports.getProfile = async (req, res) => {
  try {
    const seller = await User.findById(req.user._id).select("-password");
    if (!seller) return res.status(404).json({ message: "User not found" });
    res.json(seller);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Cannot fetch profile" });
  }
};
