import React, { useEffect, useState } from "react";

const SalesHistory = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:3000/api/orders/seller", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">ประวัติการขาย</h2>
      {orders.length === 0 ? (
        <p>ยังไม่มีใครซื้อหนังสือของคุณ</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => (
            <div key={order._id} className="border p-4 rounded shadow-sm">
              <p><strong>รหัสคำสั่งซื้อ:</strong> {order._id}</p>
              <p><strong>ผู้ซื้อ:</strong> {order.userId.name} ({order.userId.email})</p>
              <p><strong>สถานะ:</strong> {order.status}</p>
              <p><strong>รวมทั้งหมด:</strong> {order.total} บาท</p>
              <p><strong>ที่อยู่จัดส่ง:</strong> {order.address}</p>
              <div className="mt-2">
                <p className="font-semibold">รายการสินค้า:</p>
                <ul className="list-disc pl-5">
                  {order.items.map(item => (
                    <li key={item.bookId._id}>
                      {item.bookId.title} - {item.quantity} x {item.price} บาท
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalesHistory;
