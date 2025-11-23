import React, { useState, useEffect } from "react";
import axios from "axios";

const ProfileBuyer = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [avatar, setAvatar] = useState(null);
  const [message, setMessage] = useState(""); // success
  const [error, setError] = useState("");     // error
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setForm({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
        });
      } catch (err) {
        console.error("ไม่สามารถโหลดข้อมูลผู้ใช้", err);
      }
    };
    fetchProfile();
  }, [token]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/orders/buyer", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error("ไม่สามารถโหลดประวัติการสั่งซื้อ", err);
      }
    };
    fetchOrders();
  }, [token]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatar(file);
  };

  const handleSaveProfile = async () => {
    try {
      setMessage("");
      setError("");

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("address", form.address);
      if (avatar) formData.append("avatar", avatar);

      const res = await axios.patch(
        "http://localhost:3000/api/users/profile",
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );

      setUser(res.data.user);
      setEditing(false);
      setMessage("อัปเดตโปรไฟล์เรียบร้อย!");
    } catch (err) {
      console.error(err);
      setError("อัปเดตโปรไฟล์ไม่สำเร็จ");
    }
  };

  if (!user) return <p className="text-center mt-20 text-gray-500">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">โปรไฟล์ของฉัน</h1>

      {/* ข้อความแจ้งเตือน */}
      {message && <div className="bg-green-100 text-green-700 p-3 rounded">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

      {/* Card โปรไฟล์ */}
      <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
        {user.avatar ? (
          <img
            src={`http://localhost:3000/${user.avatar}`}
            alt="Avatar"
            className="w-32 h-32 object-cover rounded-full shadow"
          />
        ) : (
          <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center shadow text-gray-400 font-semibold">
            No Image
          </div>
        )}
        <div className="flex-1 space-y-2">
          <p className="text-xl font-semibold text-gray-700">{user.name}</p>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-gray-600">{user.phone}</p>
          <p className="text-gray-600">{user.address}</p>
          <button
            onClick={() => setEditing(true)}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            แก้ไขโปรไฟล์
          </button>
        </div>
      </div>

      {/* Modal แก้ไขโปรไฟล์ */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg relative shadow-lg">
            <button
              className="absolute top-3 right-3 text-gray-600 text-xl font-bold hover:text-gray-800"
              onClick={() => setEditing(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-700">แก้ไขโปรไฟล์</h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                name="name"
                placeholder="ชื่อ"
                value={form.name}
                onChange={handleChange}
                className="border p-2 rounded focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                name="email"
                placeholder="อีเมล"
                value={form.email}
                onChange={handleChange}
                className="border p-2 rounded focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="phone"
                placeholder="เบอร์โทร"
                value={form.phone}
                onChange={handleChange}
                className="border p-2 rounded focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="address"
                placeholder="ที่อยู่"
                value={form.address}
                onChange={handleChange}
                className="border p-2 rounded focus:ring-2 focus:ring-blue-500"
              />
              <input type="file" onChange={handleAvatarChange} className="mt-1" />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveProfile}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex-1"
                >
                  บันทึก
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition flex-1"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders */}
      <h2 className="text-2xl font-bold text-gray-800 mt-10">ประวัติการสั่งซื้อ</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500 mt-4">คุณยังไม่มีคำสั่งซื้อ</p>
      ) : (
        <div className="space-y-6 mt-4">
          {orders.map((order) => {
            const orderTotal = order.items.reduce(
              (total, item) => total + item.price * item.quantity,
              0
            );

            return (
              <div key={order._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
                {/* Header ของ order */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Order ID: {order._id}</h3>
                    <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <span
                    className={`mt-2 md:mt-0 px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : order.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </div>

                {/* รายการหนังสือ */}
                {/* รายการหนังสือ */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {order.items.map((item, idx) => {
    const imgSrc =
      item.bookId?.images?.[0] &&
      !item.bookId.images[0].startsWith("http")
        ? `http://localhost:3000/uploads/books/${item.bookId.images[0]}`
        : item.bookId?.images?.[0] || "/no-image.png";

    return (
      <div
        key={idx}
        className="relative bg-white border rounded-xl overflow-hidden shadow hover:shadow-lg transition transform hover:scale-105 cursor-pointer"
      >
        {/* ภาพหนังสือ */}
        <img
          src={imgSrc}
          alt={item.bookId?.title || "No Image"}
          className="w-full h-56 object-cover"
        />

        {/* Overlay เมื่อ hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex flex-col justify-end p-4 text-white">
          {item.bookId?.isSold && (
            <span className="bg-red-600 text-xs px-2 py-0.5 rounded mb-2 inline-block">
              ขายแล้ว
            </span>
          )}
          <p className="font-bold text-sm">{item.bookId?.title}</p>
          {item.bookId?.author && (
            <p className="text-xs mt-1">ผู้แต่ง: {item.bookId.author}</p>
          )}
          <p className="text-xs mt-1">จำนวน: {item.quantity}</p>
          <p className="text-red-400 font-bold mt-1">{item.price} บาท</p>
        </div>

        {/* ข้อมูลใต้ภาพสำหรับมือถือ */}
        <div className="p-3 md:hidden bg-gray-50">
          <p className="font-semibold text-gray-700 text-sm">{item.bookId?.title}</p>
          {item.bookId?.author && (
            <p className="text-gray-500 text-xs mt-1">ผู้แต่ง: {item.bookId.author}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">จำนวน: {item.quantity}</p>
          <p className="text-red-600 font-bold mt-1">{item.price} บาท</p>
        </div>
      </div>
    );
  })}
</div>


                {/* ยอดรวม Order */}
                <div className="mt-4 flex justify-end items-center space-x-4">
                  <span className="text-gray-600 font-semibold">รวมทั้งหมด:</span>
                  <span className="text-lg font-bold text-red-600">{orderTotal} บาท</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfileBuyer;
