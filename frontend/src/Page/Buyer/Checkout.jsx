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

    // กรองเฉพาะสินค้ายังขายได้ และส่ง sellerId ด้วย
    const itemsForOrder = cart
      .filter(item => !item.isSold)
      .map(item => ({
        bookId: item._id,
        quantity: item.quantity,
        price: item.price,
        sellerId: item.userId
      }));

    if (itemsForOrder.length === 0) {
      return alert("สินค้าทั้งหมดในตะกร้าขายหมดแล้ว");
    }

    try {
      console.log({ name, address, phone, paymentMethod: "promptpay", items: itemsForOrder });

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
    <div className="max-w-5xl mx-auto p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">เช็คเอาท์</h1>

      {cart.length === 0 ? (
        <p className="text-gray-500">ไม่มีสินค้าในตะกร้า</p>
      ) : (
        <div className="flex flex-col gap-6">
          {/* ฟอร์มข้อมูลผู้รับ */}
          <div className="bg-gray-50 p-4 rounded shadow flex flex-col gap-3">
            <input
              type="text"
              placeholder="ชื่อ-สกุล"
              value={name}
              onChange={e => setName(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="ที่อยู่จัดส่ง"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="เบอร์โทร"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          {/* รายการสินค้า */}
          {cart.map((item, index) => (
            <div key={item._id} className="flex items-center gap-4 bg-white p-4 rounded shadow">
              <img
                src={item.images?.[0] || "/no-image.png"}
                alt={item.title}
                className="w-20 h-28 object-cover rounded"
              />
              <div className="flex-1">
                <h2 className="font-semibold">{item.title}</h2>
                <p className="text-red-500 font-bold">{item.price} บาท</p>

                {item.isSold && (
                  <p className="text-red-600 font-semibold mt-1">ขายแล้ว</p>
                )}

                {!item.isSold && (
                  <div className="flex items-center gap-2 mt-2">
                    <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => updateQuantity(index, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => updateQuantity(index, 1)}>+</button>
                    <button className="ml-4 text-red-500 hover:underline" onClick={() => removeItem(index)}>ลบ</button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* สรุปราคาและปุ่มสั่งซื้อ */}
          <div className="bg-gray-50 p-4 rounded shadow flex justify-between items-center">
            <p className="font-semibold text-lg">ราคารวม: {total} บาท</p>
            <button
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
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
