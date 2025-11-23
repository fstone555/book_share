// src/Page/Seller/SellerEdit.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Editbook = ({ editMode }) => {
  const [form, setForm] = useState({});
  const [images, setImages] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (editMode && id) {
      const token = localStorage.getItem("token");
      fetch(`http://localhost:3000/api/seller/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setForm(data))
        .catch(err => console.error(err));
    }
  }, [editMode, id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFile = (e) => setImages([...e.target.files]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const data = new FormData();
    Object.keys(form).forEach(key => data.append(key, form[key]));
    images.forEach(file => data.append("images", file));

    try {
      await fetch(`http://localhost:3000/api/seller/books/${id}`, {
        method: "PUT",
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
      <h1 className="text-2xl font-bold mb-4">แก้ไขหนังสือ</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input name="title" value={form.title || ""} onChange={handleChange} placeholder="ชื่อหนังสือ" className="border p-2 rounded"/>
        <input name="author" value={form.author || ""} onChange={handleChange} placeholder="ผู้แต่ง" className="border p-2 rounded"/>
        <input name="price" type="number" value={form.price || ""} onChange={handleChange} placeholder="ราคา" className="border p-2 rounded"/>
        <input name="categoryId" value={form.categoryId || ""} onChange={handleChange} placeholder="หมวดหมู่" className="border p-2 rounded"/>
        <input name="condition" value={form.condition || ""} onChange={handleChange} placeholder="สภาพหนังสือ" className="border p-2 rounded"/>
        <textarea name="shortDescription" value={form.shortDescription || ""} onChange={handleChange} placeholder="รายละเอียดสั้น" className="border p-2 rounded"/>
        <input type="file" multiple onChange={handleFile}/>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">บันทึกการแก้ไข</button>
      </form>
    </div>
  );
};

export default Editbook;
