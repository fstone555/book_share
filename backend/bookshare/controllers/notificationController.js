const Notification = require("../models/Notification");

// ดึง notifications ของตัวเอง (seller / buyer)
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 }); // เรียงล่าสุดก่อน

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ทำเครื่องหมายอ่านแล้ว
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({ _id: id, userId: req.user._id });
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    notification.read = true;
    await notification.save();

    res.json({ message: "Marked as read", notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
