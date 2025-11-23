import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  // ข้อมูลผู้รับ
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const token = localStorage.getItem("token");

  // โหลดตะกร้าจาก localStorage
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart.map(item => ({ ...item, quantity: item.quantity || 1 })));
  }, []);

  // คำนวณราคารวมเฉพาะสินค้ายังขายได้
  useEffect(() => {
    const sum = cart
      .filter(item => !item.isSold)
      .reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(sum);
  }, [cart]);

  // เพิ่ม/ลดจำนวน
  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    newCart[index].quantity = Math.max(1, newCart[index].quantity + delta);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  // ลบสินค้า
  const removeItem = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  // สั่งซื้อจริง
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("ไม่มีสินค้าในตะกร้า");
    if (!name || !address || !phone) return alert("กรุณากรอกข้อมูลผู้รับให้ครบ");
    if (!token) return alert("คุณต้องล็อกอินก่อนสั่งซื้อ");

    const itemsForOrder = cart
      .filter(item => !item.isSold)
      .map(item => ({
        bookId: item._id,
        quantity: item.quantity,
        price: item.price,
        sellerId: item.userId
      }));

    if (itemsForOrder.length === 0) return alert("สินค้าทั้งหมดในตะกร้าขายหมดแล้ว");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/orders",
        {
          name,
          address,
          phone,
          paymentMethod: "promptpay",
          items: itemsForOrder
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const order = res.data;

      // เคลียร์สินค้าที่ซื้อสำเร็จออกจากตะกร้า
      const remainingCart = cart.filter(item => item.isSold || !itemsForOrder.find(i => i.bookId === item._id));
      localStorage.setItem("cart", JSON.stringify(remainingCart));
      setCart(remainingCart);

      alert(`สั่งซื้อเรียบร้อย! Order ID: ${order._id}`);
      navigate("/buyer", { state: { latestOrder: order } });
    } catch (err) {
      console.error("สั่งซื้อไม่สำเร็จ", err.response?.data || err.message);
      alert("สั่งซื้อไม่สำเร็จ: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">เช็คเอาท์</h1>

      {cart.length === 0 ? (
        <p className="text-gray-500">ไม่มีสินค้าในตะกร้า</p>
      ) : (
        <div className="flex flex-col gap-6">
          {/* ฟอร์มข้อมูลผู้รับ */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-md flex flex-col gap-4">
            <input
              type="text"
              placeholder="ชื่อ-สกุล"
              value={name}
              onChange={e => setName(e.target.value)}
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            <input
              type="text"
              placeholder="ที่อยู่จัดส่ง"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            <input
              type="text"
              placeholder="เบอร์โทร"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* รายการสินค้า */}
          <ul className="flex flex-col gap-4">
            {cart.map((item, index) => (
              <li
                key={item._id}
                className="flex flex-col md:flex-row items-center gap-4 bg-white rounded-xl shadow hover:shadow-lg transition p-4"
              >
                <img
                  src={item.images?.[0] || "/no-image.png"}
                  alt={item.title}
                  className="w-24 h-32 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 flex flex-col md:flex-row md:justify-between md:items-center gap-2 w-full">
                  <div>
                    <h2 className="font-semibold text-lg text-gray-800">{item.title}</h2>
                    <p className="text-red-500 font-bold mt-1">{item.price} บาท</p>
                    {item.isSold && <p className="text-red-600 font-semibold mt-1">ขายแล้ว</p>}
                  </div>
                  {!item.isSold && (
                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                      <button
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                        onClick={() => updateQuantity(index, -1)}
                      >
                        -
                      </button>
                      <span className="px-2">{item.quantity}</span>
                      <button
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                        onClick={() => updateQuantity(index, 1)}
                      >
                        +
                      </button>
                      <button
                        className="ml-4 text-red-500 hover:underline"
                        onClick={() => removeItem(index)}
                      >
                        ลบ
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* สรุปราคาและปุ่มสั่งซื้อ */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-semibold text-xl md:text-2xl text-gray-800">ราคารวม: {total} บาท</p>
            <button
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition text-lg font-medium"
              onClick={handleCheckout}
            >
              ยืนยันสั่งซื้อ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
