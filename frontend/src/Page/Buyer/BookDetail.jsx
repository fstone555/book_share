import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sellerStats, setSellerStats] = useState({ active: 0, sold: 0 });

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/books/${id}`);
        const bookData = {
          ...res.data,
          images:
            res.data.images?.length > 0
              ? res.data.images.map((img) =>
                  img.startsWith("http")
                    ? img
                    : `http://localhost:3000/uploads/books/${img}`
                )
              : [],
        };
        setBook(bookData);

        if (res.data.userId?._id) {
          const statsRes = await axios.get(
            `http://localhost:3000/api/seller/${res.data.userId._id}/stats`
          );
          setSellerStats(statsRes.data);
        }
      } catch (err) {
        console.error("Error fetching book:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (loading) return <p className="text-center mt-10 text-gray-500">กำลังโหลด...</p>;
  if (!book) return <p className="text-center mt-10 text-gray-500">ไม่พบหนังสือ</p>;

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cart.find(item => item._id === book._id)) return alert("มีหนังสือเล่มนี้อยู่ในตะกร้าแล้ว");
    cart.push({ ...book, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("เพิ่มหนังสือลงตะกร้าเรียบร้อย");
  };

  const buyNow = () => {
    localStorage.setItem("cart", JSON.stringify([{ ...book, quantity: 1 }]));
    navigate("/checkout");
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-10">
        {/* รูปหนังสือ */}
        <div className="md:w-1/2 relative rounded-2xl overflow-hidden shadow-xl">
          <img
            src={book.images[0] || "/no-image.png"}
            alt={book.title}
            className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
          />
          {book.isSold && (
            <span className="absolute inset-0 bg-black/60 text-white font-bold flex items-center justify-center text-3xl rounded-2xl">
              ขายแล้ว
            </span>
          )}
        </div>

        {/* ข้อมูลหนังสือ */}
        <div className="md:w-1/2 flex flex-col gap-4">
          <h1 className="text-4xl font-bold text-gray-800">{book.title}</h1>
          <p className="text-gray-600 text-lg">ผู้เขียน: <span className="font-medium">{book.author}</span></p>
          <p className="text-gray-600 text-lg">หมวดหมู่: <span className="font-medium">{book.categoryId?.name || "ไม่ระบุ"}</span></p>
          <p className="text-gray-600 text-lg">สภาพหนังสือ: <span className="font-medium">{book.condition}</span></p>
          <p className="text-gray-400 text-sm">เพิ่มเมื่อ: {new Date(book.createdAt).toLocaleDateString()}</p>
          <p className="text-red-600 font-bold text-3xl mt-2">{book.price} บาท</p>
          <p className="text-gray-700 mt-3">{book.shortDescription}</p>

          {/* ข้อมูลผู้ขาย */}
          {book.userId && (
            <div className="mt-5 p-5 border rounded-2xl bg-gray-50 shadow-md">
              <h3
                className="font-semibold text-gray-800 cursor-pointer hover:text-blue-600 hover:underline transition"
                onClick={() => navigate(`/seller/${book.userId._id}`)}
              >
                ผู้ขาย: {book.userId.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                หนังสือวางขาย: <span className="font-medium">{sellerStats.active}</span> | ขายแล้ว: <span className="font-medium">{sellerStats.sold}</span>
              </p>
              <button
                className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition font-medium"
                onClick={() => navigate(`/seller/${book.userId._id}`)}
              >
                ดูโปรไฟล์ผู้ขาย
              </button>
            </div>
          )}

          {/* ปุ่มซื้อ / ใส่ตะกร้า */}
          {!book.isSold ? (
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition text-lg font-semibold shadow"
                onClick={buyNow}
              >
                ซื้อเลย
              </button>
              <button
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition text-lg font-semibold shadow"
                onClick={addToCart}
              >
                ใส่ตะกร้า
              </button>
            </div>
          ) : (
            <p className="mt-6 text-red-600 font-semibold text-lg">หนังสือเล่มนี้ขายแล้ว</p>
          )}
        </div>
      </div>

      {/* รูปเพิ่มเติมแบบ carousel */}
      {book.images.length > 1 && (
        <div className="mt-8 overflow-x-auto flex gap-4 pb-2">
          {book.images.map((img, idx) => (
            <div key={idx} className="flex-shrink-0 w-48 h-64 rounded-2xl overflow-hidden shadow-lg cursor-pointer transition-transform duration-300 hover:scale-105">
              <img
                src={img}
                alt={`${book.title} ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookDetail;
