// src/Page/Seller/SellerAddBook.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SellerAddBook = () => {
  const [form, setForm] = useState({ title: "", author: "", price: "", categoryId: "", condition: "", shortDescription: "" });
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFile = (e) => setImages([...e.target.files]);

  const handleSubmit = async (e) => {
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">เพิ่มหนังสือใหม่</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input name="title" placeholder="ชื่อหนังสือ" value={form.title} onChange={handleChange} className="border p-2 rounded"/>
        <input name="author" placeholder="ผู้แต่ง" value={form.author} onChange={handleChange} className="border p-2 rounded"/>
        <input name="price" type="number" placeholder="ราคา" value={form.price} onChange={handleChange} className="border p-2 rounded"/>
        <input name="categoryId" placeholder="หมวดหมู่" value={form.categoryId} onChange={handleChange} className="border p-2 rounded"/>
        <input name="condition" placeholder="สภาพหนังสือ" value={form.condition} onChange={handleChange} className="border p-2 rounded"/>
        <textarea name="shortDescription" placeholder="รายละเอียดสั้น" value={form.shortDescription} onChange={handleChange} className="border p-2 rounded"/>
        <input type="file" multiple onChange={handleFile}/>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">เพิ่มหนังสือ</button>
      </form>
    </div>
  );
};

export default SellerAddBook;
