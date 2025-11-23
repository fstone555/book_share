// src/Page/Seller/SellerAddBook.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SellerAddBook = () => {
  const [form, setForm] = useState({
    title: "",
    author: "",
    price: "",
    categoryId: "",
    condition: "",
    shortDescription: "",
  });

  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files]); // เพิ่มได้หลายรูป
  };

  const removeImage = (file) =>
    setImages(images.filter((f) => f !== file));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const data = new FormData();
    Object.keys(form).forEach((key) => data.append(key, form[key]));
    images.forEach((file) => data.append("images", file));

    try {
      await fetch("http://localhost:3000/api/seller/books", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      navigate("/seller/books");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        เพิ่มหนังสือใหม่
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-8 space-y-6 border border-gray-100"
      >
        {/* INPUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="font-medium text-gray-700">ชื่อหนังสือ</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full p-3 mt-1 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              placeholder="เช่น ล่าอสูรกาย"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700">ผู้แต่ง</label>
            <input
              name="author"
              value={form.author}
              onChange={handleChange}
              className="w-full p-3 mt-1 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 transition"
              placeholder="ชื่อผู้เขียน"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700">ราคา</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              className="w-full p-3 mt-1 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 transition"
              placeholder="เช่น 150"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700">หมวดหมู่ (ID)</label>
            <input
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="w-full p-3 mt-1 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 transition"
              placeholder="ระบุ category id"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700">สภาพหนังสือ</label>
            <select
              name="condition"
              value={form.condition}
              onChange={handleChange}
              className="w-full p-3 mt-1 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 transition"
            >
              <option value="">เลือกสภาพ</option>
              <option value="new">ใหม่</option>
              <option value="used-like-new">มือสอง (สภาพดีมาก)</option>
              <option value="used">มือสอง</option>
            </select>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="font-medium text-gray-700">รายละเอียด</label>
          <textarea
            name="shortDescription"
            value={form.shortDescription}
            onChange={handleChange}
            rows={4}
            className="w-full p-3 mt-1 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 transition"
            placeholder="เขียนรายละเอียดเกี่ยวกับหนังสือ"
          />
        </div>

        {/* IMAGE UPLOAD */}
        <div>
          <p className="font-semibold text-gray-700 mb-2">อัปโหลดรูปภาพ</p>
          <input type="file" multiple onChange={handleFile} className="cursor-pointer" />

          {/* PREVIEW */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {images.map((file, index) => (
              <div
                key={index}
                className="relative group rounded-xl overflow-hidden shadow-md"
              >
                <img src={URL.createObjectURL(file)} className="w-full h-40 object-cover" />

                <button
                  type="button"
                  onClick={() => removeImage(file)}
                  className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition"
                >
                  ลบ
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition active:scale-95"
        >
          เพิ่มหนังสือ
        </button>
      </form>
    </div>
  );
};

export default SellerAddBook;
