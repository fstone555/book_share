// src/Page/Seller/SellerBooks.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SellerBooks = () => {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  const fetchBooks = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3000/api/seller/books", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const formatted = data.map((book) => ({
        ...book,
        images:
          book.images?.length > 0
            ? book.images.map((img) =>
                img.startsWith("http")
                  ? img
                  : `http://localhost:3000/uploads/books/${img}`
              )
            : [],
      }));
      setBooks(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleEdit = (id) => navigate(`/seller/books/edit/${id}`);

  const handleDelete = async (id) => {
    if (!window.confirm("คุณต้องการลบหนังสือเล่มนี้หรือไม่?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:3000/api/seller/books/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(books.filter((book) => book._id !== id));
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถลบหนังสือได้");
    }
  };

  return (
    <div className="px-6 py-6">
      <h1 className="text-2xl font-bold mb-6">หนังสือของฉัน</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {books.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 text-lg">
            คุณยังไม่มีหนังสือ
          </p>
        ) : (
          books.map((book) => (
            <div
              key={book._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer p-4 flex flex-col"
            >
              <div
                className="w-full aspect-[3/4] overflow-hidden rounded-xl shadow-sm mb-4"
                onClick={() => navigate(`/seller/books/edit/${book._id}`)}
              >
                <img
                  src={book.images[0] || "/no-image.png"}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold line-clamp-2">{book.title}</h3>
                <p className="text-red-500 font-bold mt-1">{book.price} บาท</p>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600"
                  onClick={() => handleEdit(book._id)}
                >
                  แก้ไข
                </button>
                <button
                  className="flex-1 bg-red-500 text-white p-2 rounded hover:bg-red-600"
                  onClick={() => handleDelete(book._id)}
                >
                  ลบ
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SellerBooks;
