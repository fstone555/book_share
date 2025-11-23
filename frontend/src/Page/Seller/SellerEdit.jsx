// src/Page/Seller/SellerEdit.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const SellerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    author: "",
    price: "",
    categoryId: "",
    condition: "",
    shortDescription: "",
  });

  const [oldImages, setOldImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://localhost:3000/api/seller/books/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setForm({
          title: data.title,
          author: data.author,
          price: data.price,
          categoryId: data.categoryId?._id || "",
          condition: data.condition,
          shortDescription: data.shortDescription,
        });

        const formatted = data.images?.map(
          (img) => `http://localhost:3000/uploads/books/${img}`
        );
        setOldImages(formatted || []);
      })
      .catch(console.error);
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages([...newImages, ...files]);
  };

  const removeOldImage = (url) =>
    setOldImages(oldImages.filter((img) => img !== url));

  const removeNewImage = (file) =>
    setNewImages(newImages.filter((f) => f !== file));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const fd = new FormData();

    Object.keys(form).forEach((key) => fd.append(key, form[key]));

    const keepImages = oldImages.map((url) =>
      url.replace("http://localhost:3000/uploads/books/", "")
    );
    fd.append("keepImages", JSON.stringify(keepImages));

    newImages.forEach((file) => fd.append("images", file));

    await fetch(`http://localhost:3000/api/seller/books/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    navigate("/seller/books");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        แก้ไขหนังสือ
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-8 space-y-6 border border-gray-100"
      >
        {/* INPUTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="font-medium text-gray-700">ชื่อหนังสือ</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700">ผู้แต่ง</label>
            <input
              name="author"
              value={form.author}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700">ราคา</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700">หมวดหมู่ (ID)</label>
            <input
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700">สภาพหนังสือ</label>
            <select
              name="condition"
              value={form.condition}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            >
              <option value="">เลือกสภาพ</option>
              <option value="new">ใหม่</option>
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
            className="w-full mt-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          ></textarea>
        </div>

        {/* OLD IMAGES */}
        <div>
          <p className="font-semibold text-gray-700 mb-2">รูปเดิม</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {oldImages.map((url, i) => (
              <div
                key={i}
                className="relative group rounded-xl overflow-hidden shadow-md"
              >
                <img
                  src={url}
                  className="w-full h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeOldImage(url)}
                  className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition"
                >
                  ลบ
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* NEW UPLOAD */}
        <div>
          <p className="font-semibold text-gray-700 mb-2">เพิ่มรูปใหม่</p>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="cursor-pointer"
          />

          {/* PREVIEW */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {newImages.map((file, index) => (
              <div
                key={index}
                className="relative group rounded-xl overflow-hidden shadow-md"
              >
                <img
                  src={URL.createObjectURL(file)}
                  className="w-full h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(file)}
                  className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition"
                >
                  ลบ
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition active:scale-95"
        >
          บันทึกการแก้ไข
        </button>
      </form>
    </div>
  );
};

export default SellerEdit;
