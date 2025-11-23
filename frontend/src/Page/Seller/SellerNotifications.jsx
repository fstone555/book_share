import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SellerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3000/api/notifications/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id, link) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:3000/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate(link || "/seller/books");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">แจ้งเตือน</h1>
      {notifications.length === 0 && <p className="text-gray-500">ไม่มีแจ้งเตือนใหม่</p>}
      <div className="flex flex-col gap-3">
        {notifications.map(n => (
          <div
            key={n._id}
            onClick={() => markAsRead(n._id, n.link)}
            className={`p-4 rounded-lg cursor-pointer border transition ${
              n.read ? "bg-gray-100" : "bg-blue-50 border-blue-300"
            }`}
          >
            <p className="text-gray-800">{n.message}</p>
            <span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
