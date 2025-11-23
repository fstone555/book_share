// src/Page/Seller/SellerAddBook.jsx
import React, { useState, useEffect, useRef } from "react";
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
  const [categories, setCategories] = useState([]);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/api/categories")
      .then(res => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = e => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = idx => setImages(images.filter((_, i) => i !== idx));

  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const data = new FormData();
    Object.keys(form).forEach(key => data.append(key, form[key]));
    images.forEach(file => data.append("images", file));

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
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">เพิ่มหนังสือใหม่</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 space-y-6 border border-gray-100">
        {/* INPUTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="font-medium text-gray-700">ชื่อหนังสือ</label>
            <input name="title" value={form.title} onChange={handleChange} className="w-full mt-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 transition"/>
          </div>

          <div>
            <label className="font-medium text-gray-700">ผู้แต่ง</label>
            <input name="author" value={form.author} onChange={handleChange} className="w-full mt-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 transition"/>
          </div>

          <div>
            <label className="font-medium text-gray-700">ราคา</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} className="w-full mt-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 transition"/>
          </div>

          <div>
            <label className="font-medium text-gray-700">หมวดหมู่</label>
            <select name="categoryId" value={form.categoryId} onChange={handleChange} className="w-full mt-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 transition">
              <option value="">เลือกหมวดหมู่</option>
              {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
            </select>
          </div>

          <div>
            <label className="font-medium text-gray-700">สภาพหนังสือ</label>
            <select name="condition" value={form.condition} onChange={handleChange} className="w-full mt-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 transition">
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
          <textarea name="shortDescription" value={form.shortDescription} onChange={handleChange} rows={4} className="w-full mt-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 transition"/>
        </div>

        {/* IMAGE UPLOAD */}
        <div>
          <p className="font-semibold text-gray-700 mb-2">เพิ่มรูปภาพ ({images.length} รูป)</p>
          <div className="flex items-center gap-4 mb-2">
            <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700" onClick={() => fileInputRef.current.click()}>
              เพิ่มรูป
            </button>
            {images.length > 0 && <span>{images.length} รูปถูกเลือก</span>}
          </div>
          <input type="file" multiple ref={fileInputRef} onChange={handleFile} className="hidden"/>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {images.map((file, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden border shadow-sm">
                <img src={URL.createObjectURL(file)} alt="" className="w-full h-32 object-cover"/>
                <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition">
                  ลบ
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700">
          เพิ่มหนังสือ
        </button>
      </form>
    </div>
  );
};

export default SellerAddBook;
