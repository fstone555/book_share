// Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiShoppingCart, FiSearch, FiBell } from "react-icons/fi";
import { RiStoreLine } from "react-icons/ri";

export default function Navbar({ cartCountProp }) {
  const navigate = useNavigate();
  const location = useLocation();
  const notifRef = useRef(null);

  const [query, setQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [auth, setAuth] = useState({ role: null, token: null });
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const [openNotif, setOpenNotif] = useState(false);

  const menus = {
    buyer: [{ to: "/categories", label: "หมวดหมู่" }],
    seller: [
      { to: "/seller/books", label: "หนังสือของฉัน" },
      { to: "/seller/books/add", label: "ขายหนังสือ", cta: true },
    ],
    admin: [
      { to: "/admin/approvals", label: "อนุมัติหนังสือ" },
    ],
  };

  const loggedInUserName = localStorage.getItem("loggedInUserName");
  const isBuyer = auth.role === "buyer";

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

  useEffect(() => {
    const fetchData = async () => {
      if ((auth.role === "seller" || auth.role === "admin") && auth.token) {
        try {
          if (auth.role === "seller") {
            const resOrders = await fetch("http://localhost:3000/api/orders/seller", {
              headers: { Authorization: `Bearer ${auth.token}` },
            });
            const orders = await resOrders.json();
            setNewOrdersCount(orders.filter(o => o.status === "pending").length);
          }

          const resNotif = await fetch("http://localhost:3000/api/notifications/my", {
            headers: { Authorization: `Bearer ${auth.token}` },
          });
          const notifData = await resNotif.json();
          setNotifications(notifData);
          setNewNotificationsCount(notifData.filter(n => !n.read).length);
        } catch (err) {
          console.error("โหลดแจ้งเตือนไม่สำเร็จ", err);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [auth]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setOpenNotif(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClickNotif = async (notif) => {
    if (!notif.read) {
      try {
        await fetch(`http://localhost:3000/api/notifications/${notif._id}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
        setNewNotificationsCount(prev => prev - 1);
      } catch (err) {
        console.error("Mark notification read failed", err);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (auth.role === "seller") {
      navigate(`/seller/books?q=${query.trim()}`);
    } else {
      const params = new URLSearchParams();
      if (query.trim()) params.append("q", query.trim());
      navigate(`/buyer?${params.toString()}`);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setAuth({ token: null, role: null });
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="text-xl font-bold text-blue-600">LOGO</Link>

        {/* Search */}
        <form className="hidden md:flex items-center gap-2 flex-1 mx-4" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder={auth.role === "seller" ? "ค้นหาหนังสือของฉัน..." : "ค้นหาหนังสือ..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border border-blue-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-1">
            <FiSearch /> ค้นหา
          </button>
        </form>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-4">
          {auth.role && menus[auth.role]?.map(menu => (
            <Link
              key={menu.to}
              to={menu.to}
              className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === menu.to ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"}`}
            >
              {menu.label}
            </Link>
          ))}

          {(auth.role === "seller" || auth.role === "admin") && (
            <div className="flex items-center gap-4 relative" ref={notifRef}>
              {/* Seller Orders */}
              {auth.role === "seller" && (
                <Link to="/seller/orders" className="relative text-gray-700 hover:text-blue-600 text-2xl px-1">
                  <RiStoreLine />
                  {newOrdersCount > 0 && (
                    <span className="absolute -top-1 -right-3 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{newOrdersCount}</span>
                  )}
                </Link>
              )}

              {/* Notifications Dropdown */}
              <button onClick={() => setOpenNotif(!openNotif)} className="relative text-gray-700 hover:text-blue-600 text-2xl px-1">
                <FiBell />
                {newNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-3 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{newNotificationsCount}</span>
                )}
              </button>

{openNotif && (
  <div
    className="
      absolute top-full mt-2 right-0 w-80
      bg-white rounded-xl shadow-lg
      border border-gray-200
      z-50 max-h-80 overflow-y-auto
      scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100
      animate-[fadeIn_.2s_ease-out]
    "
  >
    {/* Header */}
    <div className="sticky top-0 bg-white px-4 py-3 border-b flex justify-between items-center rounded-t-xl shadow-sm">
      <h3 className="font-semibold text-gray-800 text-sm">การแจ้งเตือน</h3>
      <button onClick={() => setOpenNotif(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">×</button>
    </div>

    {/* Empty */}
    {notifications.length === 0 ? (
      <p className="p-4 text-center text-gray-500 text-sm">ไม่มีการแจ้งเตือน</p>
    ) : (
      <ul>
        {notifications.map((n) => (
          <li
            key={n._id}
            onClick={() => handleClickNotif(n)}
            className={`
              flex items-start gap-3 px-4 py-3 cursor-pointer 
              transition-colors duration-150
              ${!n.read ? "bg-blue-50" : "hover:bg-gray-50"}
            `}
          >
            {/* Status Dot */}
            <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${n.read ? "bg-gray-300" : "bg-blue-500"}`}></div>

            {/* Message */}
            <div className="flex-1">
              <p className="text-gray-800 text-sm leading-snug">{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
)}


            </div>
          )}

          {isBuyer && (
            <Link to="/cart" className="relative text-gray-700 hover:text-blue-600">
              <FiShoppingCart className="text-xl" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>
              )}
            </Link>
          )}

          {auth.token && (
            <Link to={auth.role === "seller" ? "/seller/profile" : "/myprofile"} className="cursor-pointer text-gray-700 hover:text-blue-600">
              {loggedInUserName || "โปรไฟล์"}
            </Link>
          )}

          {!auth.token ? (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blue-600">เข้าสู่ระบบ</Link>
              <Link to="/register" className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700">สมัครสมาชิก</Link>
            </>
          ) : (
            <button className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700" onClick={handleLogout}>ออกจากระบบ</button>
          )}
        </nav>
      </div>
    </header>
  );
}
