import React, { useEffect, useState } from "react";
import axios from "axios";

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/orders/seller", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error("ไม่สามารถดึงออร์เดอร์ได้", err);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">รายการขายของฉัน</h1>
      {orders.length === 0 ? (
        <p>ยังไม่มีรายการขาย</p>
      ) : (
        orders.map(order => (
          <div key={order._id} className="border p-4 rounded mb-4">
            <p>ผู้ซื้อ: {order.buyer.name}</p>
            <p>วันที่: {new Date(order.createdAt).toLocaleString()}</p>
            <p>สถานะ: {order.status}</p>
            <ul>
              {order.items.map(item => (
                <li key={item.bookId._id}>
                  {item.bookId.title} x {item.quantity} = {item.price * item.quantity} บาท
                </li>
              ))}
            </ul>
            <p>ราคารวมของรายการนี้: {order.total} บาท</p>
          </div>
        ))
      )}
    </div>
  );
};

export default SellerOrders;
