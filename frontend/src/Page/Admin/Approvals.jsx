// Approvals.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Approvals() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("pending");
  const navigate = useNavigate();

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/seller-books/pending/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const host = "http://localhost:3000";
      const formatted = data.map(book => ({
        ...book,
        images: book.images?.length > 0
          ? book.images.map(img => (img.startsWith("http") ? img : `${host}/uploads/books/${img}`))
          : ["/no-image.png"],
      }));
      setBooks(formatted);
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถโหลดข้อมูลหนังสือได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/seller-books/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
      setBooks(prev => prev.map(b => b._id === id ? {...b, status} : b));
    } catch (err) { console.error(err); alert("ไม่สามารถอัปเดตสถานะได้"); }
  };

  const filteredBooks = books.filter(b => b.status === filter);

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">อนุมัติหนังสือ</h1>
      <div className="flex gap-3 mb-6 flex-wrap">
        {["pending","approved","rejected"].map(f => (
          <button
            key={f}
            className={`px-4 py-2 rounded-full font-medium ${
              filter===f?"bg-blue-500 text-white shadow-lg":"bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={()=>setFilter(f)}
          >
            {f==="pending"?"รออนุมัติ":f==="approved"?"อนุมัติแล้ว":"ถูกปฏิเสธ"}
          </button>
        ))}
      </div>
      {loading && <p className="text-center text-gray-500">กำลังโหลดหนังสือ...</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredBooks.length===0&&!loading && <p className="col-span-full text-center text-gray-500 text-lg">ไม่มีหนังสือในสถานะนี้</p>}
        {filteredBooks.map(book => (
          <div key={book._id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden cursor-pointer flex flex-col" onClick={()=>navigate(`/admin/books/${book._id}`)}>
            <div className="relative w-full aspect-[3/4]">
              <img src={book.images[0]} alt={book.title} className="w-full h-full object-cover"/>
              {book.status==="pending"&&<span className="absolute top-2 left-2 bg-yellow-400 text-black font-bold px-2 py-1 rounded-full text-sm">รออนุมัติ</span>}
              {book.status==="rejected"&&<span className="absolute top-2 left-2 bg-red-500 text-white font-bold px-2 py-1 rounded-full text-sm">ถูกปฏิเสธ</span>}
              {book.status==="approved"&&<span className="absolute top-2 left-2 bg-green-500 text-white font-bold px-2 py-1 rounded-full text-sm">อนุมัติแล้ว</span>}
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-semibold line-clamp-2 mb-1">{book.title}</h3>
                <p className="text-gray-600 text-sm">ผู้ขาย: {book.userId?.name || "ไม่ระบุ"}</p>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-red-500 font-bold">{book.price} บาท</span>
                {book.status==="pending"&&(
                  <div className="flex gap-2">
                    <button className="bg-green-500 text-white px-3 py-1 rounded-full text-sm hover:bg-green-600" onClick={e=>{e.stopPropagation();updateStatus(book._id,"approved")}}>อนุมัติ</button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded-full text-sm hover:bg-red-600" onClick={e=>{e.stopPropagation();updateStatus(book._id,"rejected")}}>ปฏิเสธ</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
