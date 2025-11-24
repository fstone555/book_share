// src/Page/Buyer/Categories.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    navigate(`/buyer?category=${encodeURIComponent(category.name)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
        หมวดหมู่หนังสือ
      </h1>

      {categories.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">ไม่พบหมวดหมู่</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col items-center justify-center"
              onClick={() => handleCategoryClick(cat)}
            >
              {/* ถ้ามีรูปหมวดหมู่ สามารถใส่ img ที่นี่ */}
              {/* <img src={cat.image} alt={cat.name} className="h-16 w-16 mb-3" /> */}
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 text-center">
                {cat.name}
              </h2>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
