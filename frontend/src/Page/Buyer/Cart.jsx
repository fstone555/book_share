import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  // โหลดตะกร้าจาก localStorage
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart.map(item => ({ ...item, quantity: item.quantity || 1 })));
  }, []);

  // คำนวณราคารวม
  useEffect(() => {
    const sum = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
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

  // ไปหน้าเช็คเอาท์
  const goToCheckout = () => {
    if (cart.length === 0) return alert("ไม่มีสินค้าในตะกร้า");
    navigate("/checkout");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">ตะกร้าสินค้า</h1>

      {cart.length === 0 ? (
        <p className="text-gray-500">ไม่มีสินค้าในตะกร้า</p>
      ) : (
        <div className="flex flex-col gap-6">
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
                <div className="flex items-center gap-2 mt-2">
                  <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => updateQuantity(index, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => updateQuantity(index, 1)}>+</button>
                  <button className="ml-4 text-red-500 hover:underline" onClick={() => removeItem(index)}>ลบ</button>
                </div>
                {item.isSold && (
                  <p className="mt-1 text-red-600 font-semibold">หนังสือเล่มนี้ขายแล้ว</p>
                )}
              </div>
            </div>
          ))}

          <div className="bg-gray-50 p-4 rounded shadow flex justify-between items-center">
            <p className="font-semibold text-lg">ราคารวม: {total} บาท</p>
            <button
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
              onClick={goToCheckout}
            >
              ไปเช็คเอาท์
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
