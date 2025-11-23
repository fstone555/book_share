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
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">ตะกร้าสินค้า</h1>

      {cart.length === 0 ? (
        <p className="text-gray-500 text-center py-20">ไม่มีสินค้าในตะกร้า</p>
      ) : (
        <div className="flex flex-col gap-6">
          {cart.map((item, index) => (
            <div key={item._id} className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition">
              <img
                src={item.images?.[0] || "/no-image.png"}
                alt={item.title}
                className="w-28 h-40 sm:w-32 sm:h-48 object-cover rounded-xl shadow"
              />
              <div className="flex-1 flex flex-col gap-2">
                <h2 className="font-semibold text-gray-800 text-lg">{item.title}</h2>
                <p className="text-red-600 font-bold text-xl">{item.price} บาท</p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                    onClick={() => updateQuantity(index, -1)}
                  >-</button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <button
                    className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                    onClick={() => updateQuantity(index, 1)}
                  >+</button>
                  <button
                    className="ml-4 text-red-500 hover:underline font-medium"
                    onClick={() => removeItem(index)}
                  >
                    ลบ
                  </button>
                </div>
                {item.isSold && (
                  <p className="mt-1 text-red-600 font-semibold">หนังสือเล่มนี้ขายแล้ว</p>
                )}
              </div>
            </div>
          ))}

          <div className="bg-white p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            <p className="font-semibold text-2xl text-gray-800">ราคารวม: {total} บาท</p>
            <button
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition font-semibold text-lg shadow"
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
