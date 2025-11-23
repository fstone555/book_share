import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SellerBooks = () => {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState("all"); 
  const navigate = useNavigate();

  const fetchBooks = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3000/api/seller-books", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const host = "http://localhost:3000";
      const formatted = data.map(book => ({
        ...book,
        images: book.images?.map(img => img.startsWith("http") ? img : `${host}/uploads/books/${img}`) || []
      }));
      setBooks(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const handleEdit = id => navigate(`/seller/books/edit/${id}`);
  const handleDelete = async id => {
    if (!window.confirm("คุณต้องการลบหนังสือเล่มนี้หรือไม่?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:3000/api/seller-books/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(books.filter(book => book._id !== id));
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถลบหนังสือได้");
    }
  };

  // กรองตาม filter
  const filteredBooks = books.filter(book => {
    if (filter === "pending") return book.status === "pending";
    if (filter === "approved") return book.status === "approved" && !book.isSold;
    if (filter === "rejected") return book.status === "rejected";
    if (filter === "sold") return book.isSold;
    return true;
  });

  return (
    <div className="px-6 py-6">
      <h1 className="text-2xl font-bold mb-4">หนังสือของฉัน</h1>

      <div className="flex gap-3 mb-6">
        {["all","pending","approved","rejected","sold"].map(f => (
          <button
            key={f}
            className={`px-4 py-2 rounded ${filter===f?"bg-blue-500 text-white":"bg-gray-200 text-gray-700"}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "ทั้งหมด" :
             f === "pending" ? "รออนุมัติ" :
             f === "approved" ? "ขายได้" :
             f === "rejected" ? "ถูกปฏิเสธ" : "ขายแล้ว"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {filteredBooks.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 text-lg">ไม่มีหนังสือในหมวดนี้</p>
        ) : (
          filteredBooks.map(book => (
            <div key={book._id} className={`relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-4 flex flex-col ${book.isSold?"opacity-60":""}`}>
              <div className="w-full aspect-[3/4] overflow-hidden rounded-xl shadow-sm mb-4 cursor-pointer" onClick={()=>!book.isSold && handleEdit(book._id)}>
                <img src={book.images[0] || "/no-image.png"} alt={book.title} className="w-full h-full object-cover"/>
                {book.isSold && <span className="absolute inset-0 bg-black/50 text-white font-bold flex items-center justify-center text-lg rounded-xl">ขายแล้ว</span>}
                {book.status==="pending" && <span className="absolute top-2 left-2 bg-yellow-400 text-black font-bold px-2 py-1 rounded">รออนุมัติ</span>}
                {book.status==="rejected" && <span className="absolute top-2 left-2 bg-red-500 text-white font-bold px-2 py-1 rounded">ถูกปฏิเสธ</span>}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold line-clamp-2">{book.title}</h3>
                <p className="text-red-500 font-bold mt-1">{book.price} บาท</p>
              </div>
              <div className="mt-2 flex gap-2">
                <button className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600" onClick={()=>handleEdit(book._id)} disabled={book.isSold || book.status!=="approved"}>แก้ไข</button>
                <button className="flex-1 bg-red-500 text-white p-2 rounded hover:bg-red-600" onClick={()=>handleDelete(book._id)}>ลบ</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SellerBooks;
