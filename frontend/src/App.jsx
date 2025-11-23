// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// ===== Layout =====
import BuyerLayout from "./component/layout/BuyerLayout";
import SellerLayout from "./component/layout/SellerLayout";
import AdminLayout from "./component/layout/AdminLayout";

// ===== Buyer Pages =====
import HomeBuyer from "./Page/Buyer/HomeBuyer";
import BookDetail from "./Page/Buyer/BookDetail";
import BuyerProfile from "./Page/Buyer/BuyerProfile";
import Cart from "./Page/Buyer/Cart";
import ProfileSeller from "./Page/Buyer/ProfileSeller";
import Checkout from "./Page/Buyer/Checkout";
import Categories from "./Page/Buyer/Categories";
import OrderDetail from "./Page/Buyer/BookDetail"; // ใช้ BookDetail เป็นตัวอย่าง

// ===== Seller Pages =====
import SellerBooks from "./Page/Seller/SellerBooks";
import AddBook from "./Page/Seller/SellerAddBook";
import Orders from "./Page/Seller/SellerOrders";
import Profile from "./Page/Seller/Profile";
import History from "./Page/Seller/SellerHistory";
import Editbook from "./Page/Seller/SellerEdit";

// ===== Admin Pages =====
import AdminDashboard from "./Page/Admin/AdminDashboard";
import ManageUsers from "./Page/Admin/ManageUsers";
import AdminReport from "./Page/Admin/AdminReports";
import Approvals from "./Page/Admin/Approvals";
import AdminProfile from "./Page/Admin/AdminProfile";

// ===== Auth =====
import Login from "./Page/Auth/Login";
import Unauthorized from "./Page/Auth/Unauthorized";

// ===== Auth & Role =====
const getAuth = () => ({
  token: localStorage.getItem("token") || null,
  role: localStorage.getItem("role") || null,
});

// ===== Protected Route =====
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, role } = getAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

function App() {
  const { token, role } = getAuth();

  return (
    <Router>
      <Routes>
        {/* ===== Redirect / ตาม role ===== */}
        <Route
          path="/"
          element={
            token ? (
              role === "buyer" ? (
                <Navigate to="/buyer" replace />
              ) : role === "seller" ? (
                <Navigate to="/seller" replace />
              ) : role === "admin" ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ================= Buyer ================= */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["buyer"]}>
              <BuyerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/buyer" element={<HomeBuyer />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<BuyerProfile />} />
          <Route path="/seller/:id" element={<ProfileSeller />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:orderId" element={<OrderDetail />} />
        </Route>

        {/* ================= Seller ================= */}
        <Route
          path="/seller/*"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SellerBooks />} />
          <Route path="books" element={<SellerBooks />} />
          <Route path="books/add" element={<AddBook />} />
          <Route path="books/edit/:id" element={<Editbook editMode={true} />} />
          <Route path="orders" element={<Orders />} />
          <Route path="profile" element={<Profile />} />
          <Route path="history" element={<History />} />
        </Route>

        {/* ================= Admin ================= */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="report" element={<AdminReport />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* ================= Auth ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ===== Fallback ===== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
