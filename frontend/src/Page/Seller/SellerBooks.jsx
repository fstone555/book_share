import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const BooksSeller = () => {
  const [books, setBooks] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/seller/books", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBooks(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBooks();
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">หนังสือของฉัน</h1>
        <Link
          to="/seller/books/add"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          เพิ่มหนังสือ
        </Link>
      </div>

      {books.length === 0 ? (
        <p className="text-gray-500">คุณยังไม่มีหนังสือ</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {books.map((book) => (
  <div
    key={book._id}
    className={`border rounded p-4 shadow-sm ${
      book.isSold ? "bg-gray-100" : "bg-white"
    }`}
  >
    <img
      src={book.images?.[0] ? `http://localhost:3000/${book.images[0]}` : "/no-image.png"}
      alt={book.title}
      className="w-full h-48 object-cover mb-2 rounded"
    />
    <h3 className="font-semibold text-lg">{book.title}</h3>
    <p className="text-gray-600">{book.author}</p>
    <p className="mt-1 font-bold">{book.price} บาท</p>
    <p className="mt-1 text-sm">
      สถานะ:{" "}
      <span className={`font-semibold ${book.isSold ? "text-red-500" : ""}`}>
        {book.isSold ? "ขายแล้ว" : book.status}
      </span>
    </p>
    <div className="mt-2 flex gap-2">
      {!book.isSold && (
        <Link
          to={`/seller/books/edit/${book._id}`}
          className="text-blue-600 hover:underline"
        >
          แก้ไข
        </Link>
      )}
      {book.isSold && (
        <span className="text-red-500 font-semibold">ไม่สามารถแก้ไขได้</span>
      )}
    </div>
  </div>
))}

        </div>
      )}
    </div>
  );
};

export default BooksSeller;
