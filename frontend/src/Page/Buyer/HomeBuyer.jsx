import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const HomeBuyer = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");

  const category = searchParams.get("category") || "";
  const language = searchParams.get("language") || "";

  // ===== ดึงหมวดหมู่ =====
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

  // ===== ดึงหนังสือ =====
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/books");
        const data = await res.json();
        const availableBooks = data.filter(b => b.status === "approved" && !b.isSold);
        const host = "http://localhost:3000";
        const formatted = availableBooks.map(b => ({
          ...b,
          images: b.images?.length
            ? b.images.map(img => img.startsWith("http") ? img : `${host}/uploads/books/${img}`)
            : ["/no-image.png"],
        }));
        setBooks(formatted);
      } catch (err) {
        console.error("Error fetching books:", err);
      }
    };
    fetchBooks();
  }, []);

  // ===== Debounce search =====
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams(prev => {
        if (searchValue) prev.set("q", searchValue);
        else prev.delete("q");
        return prev;
      });
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [searchValue, setSearchParams]);

  // ===== Filter books =====
  useEffect(() => {
    setFiltered(
      books.filter(b =>
        b.title.toLowerCase().includes(searchValue.toLowerCase()) &&
        (category ? b.categoryId?.name === category : true) &&
        (language ? b.language === language : true)
      )
    );
  }, [books, searchValue, category, language]);

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">หมวดหมู่หนังสือ</h1>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="ค้นหาหนังสือ..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full md:w-1/3 border p-2 rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-3 mb-6">
        {categories.map(cat => (
          <button
            key={cat._id}
            onClick={() => setSearchParams(prev => {
              prev.set("category", cat.name);
              return prev;
            })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              category === cat.name ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Books */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {filtered.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 text-lg">ไม่พบหนังสือ</p>
        ) : (
          filtered.map(book => (
            <div
              key={book._id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden cursor-pointer flex flex-col"
              onClick={() => navigate(`/book/${book._id}`)}
            >
              <div className="relative w-full aspect-[3/4]">
                <img src={book.images[0]} alt={book.title} className="w-full h-full object-cover"/>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-semibold line-clamp-2 mb-1">{book.title}</h3>
                  <p className="text-gray-600 text-sm">ผู้ขาย: {book.userId?.name || "ไม่ระบุ"}</p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-red-500 font-bold">{book.price} บาท</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomeBuyer;
