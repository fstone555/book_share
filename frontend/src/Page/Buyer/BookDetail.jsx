// BookDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/books/${id}`);
        const data = await res.json();

        // ดึงภาพ
        const images = data.images?.map((img) =>
          img.startsWith("http") ? img : `http://localhost:3000/uploads/books/${img}`
        ) || [];

        setBook({
          ...data,
          images,
          // กำหนดค่า default ถ้าไม่มี
          userEmail: data.userId?.email || "ไม่พบข้อมูล",
          userPhone: data.userId?.phone || "ไม่พบข้อมูล",
        });
        setMainImage(images[0] || "/no-image.png");
      } catch (error) {
        console.error("Error fetching book:", error);
      }
    };
    fetchBook();
  }, [id]);

  if (!book) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        {/* รูปภาพ */}
        <div className="flex-1">
          <div className="w-full aspect-[3/4] overflow-hidden rounded-xl shadow-md">
            <img src={mainImage} alt={book.title} className="w-full h-full object-cover" />
          </div>
          {book.images.length > 1 && (
            <div className="flex gap-2 mt-4">
              {book.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`thumb-${idx}`}
                  className={`w-20 h-28 object-cover rounded cursor-pointer border ${
                    mainImage === img ? "border-blue-500" : "border-gray-300"
                  }`}
                  onClick={() => setMainImage(img)}
                />
              ))}
            </div>
          )}
        </div>

        {/* รายละเอียด */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            <p className="text-gray-600 mb-4">โดย {book.author}</p>
            <p className="text-red-500 font-bold text-2xl mb-4">{book.price} บาท</p>
            <p className="text-gray-700 mb-4">{book.shortDescription}</p>
            <p className="text-gray-500 mb-6">
              สถานะ: <span className="font-semibold">{book.condition || "ไม่มีข้อมูล"}</span>
            </p>

            <div className="flex gap-4">
              <button
                className="bg-green-600 text-white p-3 rounded hover:bg-green-700 transition-colors flex-1"
                onClick={() => alert("เพิ่มไปยังรถเข็นเรียบร้อย!")}
              >
                ซื้อเลย
              </button>
              <button
                className="bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition-colors flex-1"
                onClick={() => setShowModal(true)}
              >
                ติดต่อผู้ขาย
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 relative">
            <h2 className="text-xl font-bold mb-4">ติดต่อผู้ขาย</h2>
            <p className="mb-4">Email: {book.userEmail}</p>
            <p className="mb-4">โทรศัพท์: {book.userPhone}</p>
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <button
              className="mt-4 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
              onClick={() => {
                alert("ผู้ขายถูกติดต่อเรียบร้อย!");
                setShowModal(false);
              }}
            >
              ส่งข้อความ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;
