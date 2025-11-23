import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AdminBookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBook = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/seller-books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const host = "http://localhost:3000";

      setBook({
        ...data,
        images: data.images?.length > 0
          ? data.images.map(img => img.startsWith("http") ? img : `${host}/uploads/books/${img}`)
          : ["/no-image.png"],
      });
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถโหลดข้อมูลหนังสือได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBook(); }, [id]);

  const updateStatus = async (status) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:3000/api/seller-books/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      alert(`หนังสือถูก${status === "approved" ? "อนุมัติ" : "ปฏิเสธ"}แล้ว`);
      navigate("/admin/approvals");
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถอัปเดตสถานะได้");
    }
  };

  if (loading) return <p className="text-center text-gray-500 mt-10">กำลังโหลดข้อมูล...</p>;
  if (!book) return <p className="text-center text-gray-500 mt-10">ไม่พบหนังสือ</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button
        className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2 font-medium"
        onClick={() => navigate(-1)}
      >
        ← กลับ
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        {/* รูปหลัก + รูปเพิ่มเติม */}
        <div className="md:w-1/2 flex flex-col gap-4">
          <img
            src={book.images[0]}
            alt={book.title}
            className="w-full h-80 md:h-96 object-cover rounded-2xl shadow-lg border border-gray-200"
          />
          {book.images.length > 1 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {book.images.slice(1).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${book.title}-${idx + 2}`}
                  className="w-full h-40 object-cover rounded-xl shadow-sm border border-gray-100 hover:scale-105 transition-transform"
                />
              ))}
            </div>
          )}
        </div>

        {/* ข้อมูลหนังสือ */}
        <div className="md:w-1/2 flex flex-col justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">{book.title}</h1>
            <p className="text-gray-500 mt-2">ผู้ขาย: <span className="font-medium">{book.userId?.name || "ไม่ระบุ"}</span></p>
            <p className="text-gray-500 mt-1">ผู้แต่ง: <span className="font-medium">{book.author || "ไม่ระบุ"}</span></p>
            <p className="text-red-500 font-bold text-3xl mt-4">{book.price} บาท</p>

            {book.description && (
              <div className="mt-6 bg-gray-50 p-4 rounded-xl shadow-sm">
                <h2 className="font-semibold text-gray-700 mb-2">รายละเอียด</h2>
                <p className="text-gray-700 leading-relaxed">{book.description}</p>
              </div>
            )}

            {/* Badge Status */}
            <span
              className={`inline-block px-5 py-2 mt-6 rounded-full font-semibold text-sm ${
                book.status === "pending" ? "bg-yellow-400 text-black" :
                book.status === "approved" ? "bg-green-600 text-white" : "bg-red-600 text-white"
              }`}
            >
              {book.status === "pending" ? "รออนุมัติ" : book.status === "approved" ? "อนุมัติแล้ว" : "ถูกปฏิเสธ"}
            </span>
          </div>

          {/* Actions */}
          {book.status === "pending" && (
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                className="flex-1 bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 transition font-semibold shadow-md"
                onClick={() => updateStatus("approved")}
              >
                อนุมัติ
              </button>
              <button
                className="flex-1 bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition font-semibold shadow-md"
                onClick={() => updateStatus("rejected")}
              >
                ปฏิเสธ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
