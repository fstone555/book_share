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

  // โหลดหนังสือจาก backend
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/books");
        const data = await res.json();

        const formatted = data.map((book) => ({
          ...book,
          images:
            book.images?.length > 0
              ? book.images.map((img) =>
                  img.startsWith("http")
                    ? img
                    : `http://localhost:3000/uploads/books/${img}`
                )
              : [],
        }));

        setBooks(formatted);
      } catch (error) {
        console.error("Error loading books:", error);
      }
    };
    fetchBooks();
  }, []);

  // กรองหนังสือตาม query / category / language
  useEffect(() => {
    setFiltered(
      books.filter((b) =>
        b.title.toLowerCase().includes(query.toLowerCase()) &&
        (category ? b.category === category : true) &&
        (language ? b.language === language : true)
      )
    );
  }, [books, query, category, language]);

  return (
    <div className="px-6 py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {filtered.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 text-lg">
            ไม่พบบุ๊คที่ค้นหา
          </p>
        ) : (
          filtered.map((book) => (
            <div
              key={book._id}
              className={`relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer p-4 ${
                book.isSold ? "opacity-60 cursor-not-allowed" : ""
              }`}
              onClick={() => !book.isSold && navigate(`/book/${book._id}`)}
            >
              <div className="w-full aspect-[3/4] overflow-hidden rounded-xl shadow-sm relative">
                <img
                  src={book.images[0] || "/no-image.png"}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
                {book.isSold && (
                  <span className="absolute inset-0 bg-black/50 text-white font-bold flex items-center justify-center text-lg rounded-xl">
                    ขายแล้ว
                  </span>
                )}
              </div>

              <div className="mt-4">
                <h3 className="text-base font-semibold line-clamp-2">{book.title}</h3>
                <p className="text-red-500 font-bold mt-1">{book.price} บาท</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomeBuyer;
