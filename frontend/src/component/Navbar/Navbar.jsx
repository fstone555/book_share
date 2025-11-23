import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiShoppingCart, FiMenu, FiX, FiSearch } from "react-icons/fi";

export default function Navbar({ cartCountProp }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [openMobile, setOpenMobile] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [auth, setAuth] = useState({ role: null, token: null });
  const [newOrdersCount, setNewOrdersCount] = useState(0); // สำหรับ seller

  const menus = {
    buyer: [{ to: "/categories", label: "หมวดหมู่" }],
    seller: [
      { to: "/seller/books", label: "หนังสือของฉัน" },
      { to: "/seller/books/add", label: "ขายหนังสือ", cta: true },
      { to: "/seller/history", label: "ประวัติการขาย" },
    ],
    admin: [
      { to: "/admin/dashboard", label: "แดชบอร์ดแอดมิน" },
      { to: "/admin/users", label: "จัดการผู้ใช้" },
      { to: "/admin/approvals", label: "อนุมัติหนังสือ" },
    ],
  };

  // โหลด token, role และ cart count
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    setAuth({ token, role });

    const updateCartCount = () => {
      const cartFromStorage = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(typeof cartCountProp === "number" ? cartCountProp : cartFromStorage.length);
    };

    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    return () => window.removeEventListener("cartUpdated", updateCartCount);
  }, [cartCountProp, location.pathname]);

  // โหลดจำนวน order ใหม่สำหรับ seller
  useEffect(() => {
    const fetchNewOrdersCount = async () => {
      if (auth.role === "seller" && auth.token) {
        try {
          const res = await fetch("http://localhost:3000/api/orders/seller/new", {
            headers: { Authorization: `Bearer ${auth.token}` },
          });
          const data = await res.json();
          setNewOrdersCount(data.count || 0);
        } catch (err) {
          console.error("ไม่สามารถโหลดจำนวนออร์เดอร์ใหม่", err);
        }
      }
    };

    fetchNewOrdersCount();
    const interval = setInterval(fetchNewOrdersCount, 30000); // refresh ทุก 30 วินาที
    return () => clearInterval(interval);
  }, [auth]);

  const loggedInUserName = localStorage.getItem("loggedInUserName");
  const isBuyer = auth.role === "buyer";

  const handleLogout = () => {
    localStorage.clear();
    setAuth({ token: null, role: null });
    navigate("/login");
    setOpenMobile(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.append("q", query.trim());
    if (categoryFilter) params.append("category", categoryFilter);
    if (languageFilter) params.append("language", languageFilter);

    navigate(`/buyer?${params.toString()}`);
    setOpenMobile(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center">
          <button
            className="md:hidden text-2xl mr-2 text-blue-600"
            onClick={() => setOpenMobile(!openMobile)}
          >
            {openMobile ? <FiX /> : <FiMenu />}
          </button>
          <Link to="/" className="text-xl font-bold text-blue-600" onClick={() => setOpenMobile(false)}>
            LOGO
          </Link>
        </div>

        {/* Desktop Search */}
        <form className="hidden md:flex items-center gap-2 flex-1 mx-4" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="ค้นหาหนังสือ ชื่อเรื่อง ผู้แต่ง..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border border-blue-300 rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border-t border-b border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ทุกหมวดหมู่</option>
            <option value="นิยาย">นิยาย</option>
            <option value="การ์ตูน">การ์ตูน</option>
            <option value="พัฒนาตนเอง">พัฒนาตนเอง</option>
            <option value="หนังสือเรียน">หนังสือเรียน</option>
          </select>
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="border border-blue-300 rounded-r-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ทุกภาษา</option>
            <option value="ไทย">ไทย</option>
            <option value="อังกฤษ">อังกฤษ</option>
            <option value="ญี่ปุ่น">ญี่ปุ่น</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-1"
          >
            <FiSearch /> ค้นหา
          </button>
        </form>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4">
          {auth.role &&
            menus[auth.role]?.map((menu) => (
              <Link
                key={menu.to}
                to={menu.to}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  menu.cta
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : location.pathname === menu.to
                    ? "text-blue-600 font-semibold"
                    : "text-gray-700 hover:text-blue-600"
                }`}
                onClick={() => setOpenMobile(false)}
              >
                {menu.label}
              </Link>
            ))}

          {/* รายการสั่งซื้อ สำหรับ seller */}
          {auth.role === "seller" && (
            <Link
              to="/seller/orders"
              className="relative text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
              onClick={() => setOpenMobile(false)}
            >
              รายการสั่งซื้อ
              {newOrdersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {newOrdersCount}
                </span>
              )}
            </Link>
          )}

          {isBuyer && (
            <Link to="/cart" className="relative text-gray-700 hover:text-blue-600">
              <FiShoppingCart className="text-xl" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {auth.token && (
            <Link
              to={auth.role === "seller" ? "/seller/profile" : "/myprofile"}
              className="cursor-pointer text-gray-700 hover:text-blue-600"
              onClick={() => setOpenMobile(false)}
            >
              {loggedInUserName || "โปรไฟล์"}
            </Link>
          )}

          {!auth.token && (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blue-600">
                เข้าสู่ระบบ
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
              >
                สมัครสมาชิก
              </Link>
            </>
          )}

          {auth.token && (
            <button
              className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
              onClick={handleLogout}
            >
              ออกจากระบบ
            </button>
          )}
        </nav>
      </div>

      {/* Mobile menu */}
      {openMobile && (
        <div className="md:hidden bg-white shadow-md border-t border-blue-200">
          <form className="flex flex-col p-4 gap-2" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="ค้นหาหนังสือ..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border border-blue-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-blue-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทุกหมวดหมู่</option>
              <option value="นิยาย">นิยาย</option>
              <option value="การ์ตูน">การ์ตูน</option>
              <option value="พัฒนาตนเอง">พัฒนาตนเอง</option>
              <option value="หนังสือเรียน">หนังสือเรียน</option>
            </select>
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="border border-blue-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทุกภาษา</option>
              <option value="ไทย">ไทย</option>
              <option value="อังกฤษ">อังกฤษ</option>
              <option value="ญี่ปุ่น">ญี่ปุ่น</option>
            </select>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 rounded-md mt-2 flex items-center justify-center gap-1 hover:bg-blue-700"
            >
              <FiSearch /> ค้นหา
            </button>

            {/* Mobile menu items */}
            {auth.role &&
              menus[auth.role]?.map((menu) => (
                <Link
                  key={menu.to}
                  to={menu.to}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                  onClick={() => setOpenMobile(false)}
                >
                  {menu.label}
                </Link>
              ))}

            {/* รายการสั่งซื้อ Mobile */}
            {auth.role === "seller" && (
              <Link
                to="/seller/orders"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md flex justify-between items-center"
                onClick={() => setOpenMobile(false)}
              >
                รายการสั่งซื้อ
                {newOrdersCount > 0 && (
                  <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {newOrdersCount}
                  </span>
                )}
              </Link>
            )}
          </form>
        </div>
      )}
    </header>
  );
}
