import React, { useState, useEffect } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [avatar, setAvatar] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
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
      <h1 className="text-3xl font-bold text-gray-800">โปรไฟล์ผู้ขาย</h1>

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
            <h2 className="text-2xl font-bold mb-4 text-gray-700">แก้ไขโปรไฟล์ผู้ขาย</h2>
            <div className="flex flex-col gap-3">
              <input type="text" name="name" placeholder="ชื่อ" value={form.name} onChange={handleChange} className="border p-2 rounded focus:ring-2 focus:ring-blue-500"/>
              <input type="email" name="email" placeholder="อีเมล" value={form.email} onChange={handleChange} className="border p-2 rounded focus:ring-2 focus:ring-blue-500"/>
              <input type="text" name="phone" placeholder="เบอร์โทร" value={form.phone} onChange={handleChange} className="border p-2 rounded focus:ring-2 focus:ring-blue-500"/>
              <input type="text" name="address" placeholder="ที่อยู่" value={form.address} onChange={handleChange} className="border p-2 rounded focus:ring-2 focus:ring-blue-500"/>
              <input type="file" onChange={handleAvatarChange} className="mt-1"/>
              <div className="flex gap-2 mt-2">
                <button onClick={handleSaveProfile} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex-1">
                  บันทึก
                </button>
                <button onClick={() => setEditing(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition flex-1">
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
