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
      setBooks(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const handleEdit = (id) => navigate(`/seller/books/edit/${id}`);
  const handleAdd = () => navigate("/seller/books/add");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">หนังสือของฉัน</h1>
      <button onClick={handleAdd} className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-md">
        เพิ่มหนังสือ
      </button>
      {books.length === 0 ? (
        <p>คุณยังไม่มีหนังสือ</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {books.map((book) => (
            <div key={book._id} className="border p-4 rounded-md shadow-md">
              <h3 className="font-semibold">{book.title}</h3>
              <p>ราคา: {book.price} บาท</p>
              <p>หมวด: {book.categoryId?.name || "-"}</p>
              <button onClick={() => handleEdit(book._id)} className="mt-2 bg-green-500 text-white px-2 py-1 rounded">
                แก้ไข
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerBooks;
