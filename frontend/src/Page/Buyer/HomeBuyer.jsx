import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const HomeBuyer = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchParams] = useSearchParams();

  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const language = searchParams.get("language") || "";

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/books");
        const data = await res.json();
        // แสดงเฉพาะหนังสือที่ approved และยังไม่ได้ขาย
        const availableBooks = data.filter(book => book.status === "approved" && !book.isSold);
        const formatted = availableBooks.map(book => ({
          ...book,
          images: book.images?.length > 0
            ? book.images.map(img => img.startsWith("http") ? img : `http://localhost:3000/uploads/books/${img}`)
            : ["/no-image.png"],
        }));
        setBooks(formatted);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    setFiltered(
      books.filter(b =>
        b.title.toLowerCase().includes(query.toLowerCase()) &&
        (category ? b.category === category : true) &&
        (language ? b.language === language : true)
      )
    );
  }, [books, query, category, language]);

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {filtered.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 text-lg">ไม่พบหนังสือ</p>
        ) : (
          filtered.map(book => (
            <div
              key={book._id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden cursor-pointer flex flex-col"
              onClick={() => navigate(`/book/${book._id}`)}
            >
              <div className="relative w-full aspect-[3/4]">
                <img src={book.images[0]} alt={book.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-semibold line-clamp-2 mb-1">{book.title}</h3>
                  <p className="text-gray-600 text-sm">ผู้ขาย: {book.userId?.name || "ไม่ระบุ"}</p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-red-500 font-bold">{book.price} บาท</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomeBuyer;
