import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ProfileSeller = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        // ดึงข้อมูลผู้ขาย
        const sellerRes = await axios.get(`http://localhost:3000/api/users/${sellerId}`);
        setSeller(sellerRes.data);

        // ดึงหนังสือผู้ขาย
        const booksRes = await axios.get(`http://localhost:3000/api/seller/${sellerId}/books`);
        const formattedBooks = booksRes.data.map((book) => ({
          ...book,
          images:
            book.images?.length > 0
              ? book.images.map((img) =>
                  img.startsWith("http") ? img : `http://localhost:3000/uploads/books/${img}`
                )
              : [],
        }));
        setBooks(formattedBooks);
      } catch (err) {
        console.error("ไม่สามารถดึงข้อมูลผู้ขายได้", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSeller();
  }, [sellerId]);

  if (loading) return <p className="text-center mt-10">กำลังโหลด...</p>;
  if (!seller) return <p className="text-center mt-10">ไม่พบผู้ขาย</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* ข้อมูลผู้ขาย */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h1 className="text-2xl font-bold">{seller.name}</h1>
        <p className="text-gray-600">{seller.email}</p>
      </div>

      {/* หนังสือของผู้ขาย */}
      <h2 className="text-xl font-semibold mb-4">หนังสือของผู้ขาย</h2>
      {books.length === 0 ? (
        <p className="text-gray-500 mb-6">ผู้ขายยังไม่มีหนังสือ</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-6">
          {books.map((book) => (
            <div
              key={book._id}
              className={`relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer p-4 ${
                book.isSold ? "opacity-60 cursor-not-allowed" : ""
              }`}
              onClick={() => !book.isSold && navigate(`/book/${book._id}`)}
            >
              <div className="w-full aspect-[3/4] overflow-hidden rounded-xl shadow-sm relative">
                <img
                  src={book.images[0] || "/no-image.png"}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
                {book.isSold && (
                  <span className="absolute inset-0 bg-black/50 text-white font-bold flex items-center justify-center text-lg rounded-xl">
                    ขายแล้ว
                  </span>
                )}
              </div>
              <div className="mt-2">
                <h3 className="text-base font-semibold line-clamp-2">{book.title}</h3>
                <p className="text-red-500 font-bold mt-1">{book.price} บาท</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ประวัติการขาย (ถ้ามี) */}
      <SellerOrders sellerId={sellerId} />
    </div>
  );
};

export default ProfileSeller;

// แยก Component ดึงประวัติการขาย
const SellerOrders = ({ sellerId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/orders/seller/${sellerId}`);
        setOrders(res.data);
      } catch (err) {
        console.error("ไม่สามารถดึงประวัติการขายได้", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [sellerId]);

  if (loading) return <p className="text-gray-500 mt-4">กำลังโหลดประวัติการขาย...</p>;
  if (orders.length === 0) return <p className="text-gray-500 mt-4">ผู้ขายยังไม่มีการขาย</p>;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">ประวัติการขาย</h2>
      {orders.map((order) => (
        <div key={order._id} className="bg-white shadow rounded p-4 mb-4">
          <h3 className="font-semibold mb-2">Order ID: {order._id}</h3>
          <p>ผู้ซื้อ: {order.userId.name} ({order.userId.email})</p>
          <p>ที่อยู่จัดส่ง: {order.address}</p>
          <p>สถานะ: <span className="font-semibold">{order.status}</span></p>
          <p>รวมทั้งหมด: {order.total} บาท</p>
          <div className="mt-2">
            <h4 className="font-semibold">รายการสินค้าที่ขาย:</h4>
            {order.items
              .filter(item => item.bookId.userId === sellerId)
              .map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 mt-2">
                  <img
                    src={item.bookId.images?.[0] || "/no-image.png"}
                    alt={item.bookId.title}
                    className="w-20 h-28 object-cover rounded"
                  />
                  <div>
                    <p>{item.bookId.title}</p>
                    <p>จำนวน: {item.quantity}</p>
                    <p>ราคา: {item.price} บาท</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
