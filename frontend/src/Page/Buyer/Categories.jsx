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
    // redirect ไปหน้า buyer พร้อม filter category
    navigate(`/buyer?category=${encodeURIComponent(category.name)}`);
  };

  return (
    <div className="px-6 py-6">
      <h1 className="text-2xl font-bold mb-6">หมวดหมู่หนังสือ</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">ไม่พบหมวดหมู่</p>
        ) : (
          categories.map((cat) => (
            <div
              key={cat._id}
              className="cursor-pointer bg-white rounded-xl shadow-md hover:shadow-lg p-6 text-center transition-all"
              onClick={() => handleCategoryClick(cat)}
            >
              <h2 className="text-lg font-semibold">{cat.name}</h2>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Categories;
