import React, { useEffect, useState } from "react";
import axios from "axios";

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [trackingInputs, setTrackingInputs] = useState({});
  const [editing, setEditing] = useState({}); // เก็บสถานะแก้ไข
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("trackingInputs");
    if (saved) setTrackingInputs(JSON.parse(saved));
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/orders/seller", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const saved = JSON.parse(localStorage.getItem("trackingInputs") || "{}");
      const mergedOrders = res.data.map(order => ({
        ...order,
        trackingNumber: saved[order._id] || order.trackingNumber || "",
      }));
      setOrders(mergedOrders);
    } catch (err) {
      console.error("ไม่สามารถดึงออร์เดอร์ได้", err);
    }
  };

  const handleTrackingChange = (orderId, value) => {
    const newInputs = { ...trackingInputs, [orderId]: value };
    setTrackingInputs(newInputs);
    localStorage.setItem("trackingInputs", JSON.stringify(newInputs));
  };

  const handleShip = async (orderId) => {
    const trackingNumber = trackingInputs[orderId];
    if (!trackingNumber) return alert("กรุณากรอก Tracking Number");

    try {
      await axios.patch(
        `http://localhost:3000/api/orders/${orderId}/ship`,
        { trackingNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("อัปเดตสถานะแล้ว!");
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId
            ? { ...order, status: "shipped", trackingNumber }
            : order
        )
      );
      setEditing(prev => ({ ...prev, [orderId]: false }));
      const newInputs = { ...trackingInputs, [orderId]: trackingNumber };
      setTrackingInputs(newInputs);
      localStorage.setItem("trackingInputs", JSON.stringify(newInputs));
    } catch (err) {
      console.error(err);
      alert("อัปเดตสถานะไม่สำเร็จ");
    }
  };

  const toggleEdit = (orderId) => {
    setEditing(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const statusColor = (status) => {
    switch(status) {
      case "pending": return "bg-yellow-500";
      case "paid": return "bg-green-500";
      case "shipped": return "bg-blue-500";
      case "delivered": return "bg-gray-500";
      default: return "bg-gray-400";
    }
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">รายการสั่งซื้อของฉัน</h1>
        <p className="text-gray-500 text-lg">ยังไม่มีรายการสั่งซื้อ</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">รายการสั่งซื้อของฉัน</h1>

      {orders.map(order => {
        const orderTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const isEditing = editing[order._id];
        const trackingValue = trackingInputs[order._id] || order.trackingNumber || "";

        return (
          <div key={order._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition duration-300">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">ผู้ซื้อ: {order.buyer.name}</h2>
                <p className="text-gray-500 text-sm">{order.buyer.address}</p>
                <p className="text-gray-500 text-sm">โทร: {order.buyer.phone}</p>
                <p className="text-gray-500 text-sm mt-1">วันที่สั่งซื้อ: {new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <span
                className={`mt-2 md:mt-0 px-4 py-1 rounded-full font-semibold text-white text-sm shadow ${statusColor(order.status)}`}
              >
                {order.status.toUpperCase()}
              </span>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {order.items.map(item => (
                <div key={item._id} className="relative bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition transform hover:-translate-y-1 hover:scale-105 cursor-pointer">
                  <img
                    src={item.bookId.images?.[0] ? `http://localhost:3000/uploads/books/${item.bookId.images[0]}` : "/no-image.png"}
                    alt={item.bookId.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex flex-col justify-end p-3 text-white">
                    <p className="font-bold text-sm">{item.bookId.title}</p>
                    {item.bookId.author && <p className="text-xs mt-1">ผู้แต่ง: {item.bookId.author}</p>}
                    <p className="text-xs mt-1">จำนวน: {item.quantity}</p>
                    <p className="text-red-400 font-semibold mt-1">{item.price} ฿</p>
                    {item.bookId.isSold && <span className="mt-1 bg-red-600 text-xs px-2 py-0.5 rounded">ขายแล้ว</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer: Tracking & Total */}
            <div className="mt-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex gap-2 items-center">
                <span className="font-medium text-gray-700">หมายเลข Tracking:</span>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      placeholder="กรอก Tracking Number"
                      className="border rounded-full p-2 w-48 focus:ring focus:ring-blue-200"
                      value={trackingValue}
                      onChange={e => handleTrackingChange(order._id, e.target.value)}
                    />
                    <button
                      onClick={() => handleShip(order._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
                    >
                      บันทึก
                    </button>
                  </>
                ) : (
                  <span className="text-gray-800 font-medium">{trackingValue}</span>
                )}
                {order.status !== "shipped" && (
                  <button
                    onClick={() => toggleEdit(order._id)}
                    className="text-blue-500 hover:underline ml-2"
                  >
                    {isEditing ? "ยกเลิก" : "แก้ไข"}
                  </button>
                )}
              </div>
              <p className="text-gray-800 font-bold text-lg">
                รวมทั้งหมด: <span className="text-red-600">{orderTotal} ฿</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SellerOrders;
