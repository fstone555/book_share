const Book = require('../models/Book');
const Notification = require('../models/Notification');

const updateStatus = async (id, status) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3000/api/seller-books/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "อัปเดตสถานะไม่สำเร็จ");
    }

    // อัปเดต local state ทันที
    setBooks(prevBooks =>
      prevBooks.map(b => b._id === id ? {...b, status} : b)
    );
  } catch (err) {
    console.error("Update status error:", err);
    alert("ไม่สามารถอัปเดตสถานะได้");
  }
};

