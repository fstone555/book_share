import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/books/${id}`);
        setBook({
          ...res.data,
          images:
            res.data.images?.length > 0
              ? res.data.images.map((img) =>
                  img.startsWith("http")
                    ? img
                    : `http://localhost:3000/uploads/books/${img}`
                )
              : [],
        });
      } catch (err) {
        console.error("Error fetching book:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (loading) return <p className="text-center mt-10">กำลังโหลด...</p>;
  if (!book) return <p className="text-center mt-10">ไม่พบหนังสือ</p>;

  // เพิ่มลงตะกร้า
  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const exists = cart.find(item => item._id === book._id);
    if (exists) {
      alert("มีหนังสือเล่มนี้อยู่ในตะกร้าแล้ว");
      return;
    }
    cart.push({ ...book, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("เพิ่มหนังสือลงตะกร้าเรียบร้อย");
  };

  // ซื้อเลย → ไปหน้า Checkout
  const buyNow = () => {
    // สร้างตะกร้าชั่วคราวสำหรับซื้อเล่มนี้
    localStorage.setItem("cart", JSON.stringify([{ ...book, quantity: 1 }]));
    navigate("/checkout");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* รูปภาพ */}
        <div className="md:w-1/2 relative">
          <img
            src={book.images[0] || "/no-image.png"}
            alt={book.title}
            className="w-full h-auto rounded-xl object-cover"
          />
          {book.isSold && (
            <span className="absolute inset-0 bg-black/50 text-white font-bold flex items-center justify-center text-2xl rounded-xl">
              ขายแล้ว
            </span>
          )}
        </div>

        {/* ข้อมูลหนังสือ */}
        <div className="md:w-1/2 flex flex-col gap-4">
          <h1 className="text-2xl font-bold">{book.title}</h1>
          <p className="text-gray-600">ผู้เขียน: {book.author}</p>
          <p className="text-red-500 font-bold text-xl">{book.price} บาท</p>
          <p className="text-gray-700">{book.shortDescription}</p>

          {!book.isSold ? (
            <div className="flex gap-4 mt-4">
              <button
                className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
                onClick={buyNow}
              >
                ซื้อเลย
              </button>
              <button
                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
                onClick={addToCart}
              >
                ใส่ตะกร้า
              </button>
            </div>
          ) : (
            <p className="mt-4 text-red-600 font-semibold">หนังสือเล่มนี้ขายแล้ว</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
