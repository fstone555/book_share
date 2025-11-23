import React, { useEffect, useState } from "react";

const ProfileSeller = () => {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/orders/seller", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("ไม่สามารถดึงประวัติการขายได้", err);
      }
    };
    fetchOrders();
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">ประวัติการขาย</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">คุณยังไม่มีการขาย</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="bg-white shadow rounded p-4 mb-4">
            <h2 className="font-semibold mb-2">Order ID: {order._id}</h2>
            <p>ผู้ซื้อ: {order.userId.name} ({order.userId.email})</p>
            <p>ที่อยู่จัดส่ง: {order.address}</p>
            <p>สถานะ: <span className="font-semibold">{order.status}</span></p>
            <p>รวมทั้งหมด: {order.total} บาท</p>
            <div className="mt-2">
              <h3 className="font-semibold">รายการสินค้าที่ขาย:</h3>
              {order.items
                .filter(item => item.bookId.userId === order.sellerId) // เฉพาะสินค้าของผู้ขายนี้
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
        ))
      )}
    </div>
  );
};

export default ProfileSeller;
