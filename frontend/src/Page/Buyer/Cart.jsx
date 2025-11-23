// src/Page/Buyer/Cart.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const removeItem = (id) => {
    const updated = cart.filter(item => item._id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-4">ตะกร้าสินค้า</h1>
      {cart.length === 0 ? (
        <p>ไม่มีสินค้าในตะกร้า</p>
      ) : (
        <>
          <ul>
            {cart.map(item => (
              <li key={item._id} className="flex justify-between mb-2">
                <span>{item.title}</span>
                <span>{item.price} บาท</span>
                <button
                  className="text-red-500"
                  onClick={() => removeItem(item._id)}
                >
                  ลบ
                </button>
              </li>
            ))}
          </ul>
          <p className="font-bold mt-4">รวมทั้งหมด: {total} บาท</p>
          <button
            className="bg-green-600 text-white px-4 py-2 mt-2 rounded-md hover:bg-green-700"
            onClick={() => navigate("/checkout")}
          >
            ไปชำระเงิน
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;
