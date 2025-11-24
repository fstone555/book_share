// src/Page/Auth/Auth.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/LOGO.svg"

export default function Auth() {
  const [tab, setTab] = useState("login"); // login หรือ register
  const navigate = useNavigate();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("buyer"); // default เป็นผู้ซื้อ
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("loggedInUserName", data.user.name);

      redirectByRole(data.user.role);
    } catch (err) {
      console.error(err);
      setLoginError("Server error. Please try again later.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");

    try {
      const res = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, role: regRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        setRegError(data.message || "Registration failed");
        return;
      }

      setRegSuccess("สมัครสมาชิกเรียบร้อย! กำลังไปหน้าเข้าสู่ระบบ...");
      setTimeout(() => setTab("login"), 2000);
    } catch (err) {
      console.error(err);
      setRegError("Server error. Please try again later.");
    }
  };

  const redirectByRole = (role) => {
    switch (role) {
      case "buyer":
        navigate("/buyer");
        break;
      case "seller":
        navigate("/seller");
        break;
      case "admin":
        navigate("/admin/dashboard");
        break;
      default:
        navigate("/");
    }
  };

  return (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="w-full max-w-sm space-y-8">

      {/* Logo / Title */}
      <div className="text-center">
        <img
  src={logo}
  alt="MyBook Logo"
  className="h-12 w-auto mx-auto"
/>
        <p className="text-gray-500 text-sm mt-2">
          {tab === "login" ? "เข้าสู่ระบบบัญชีของคุณ" : "สร้างบัญชีใหม่ของคุณ"}
        </p>
      </div>

      {/* Card Box */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

        {/* Tabs */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 pb-2 text-center font-medium text-sm transition ${
              tab === "login"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            เข้าสู่ระบบ
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 pb-2 text-center font-medium text-sm transition ${
              tab === "register"
                ? "border-b-2 border-green-600 text-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            สมัครสมาชิก
          </button>
        </div>

        {/* Login Form */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="bg-red-50 text-red-600 text-sm p-2 rounded text-center">
                {loginError}
              </div>
            )}

            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
              placeholder="อีเมล"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />

            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
              placeholder="รหัสผ่าน"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold">
              เข้าสู่ระบบ
            </button>

            <p className="text-center text-sm text-blue-600 hover:underline cursor-pointer mt-2">
              ลืมรหัสผ่าน?
            </p>
          </form>
        )}

        {/* Register Form */}
        {tab === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            {regError && (
              <div className="bg-red-50 text-red-600 text-sm p-2 rounded text-center">
                {regError}
              </div>
            )}

            {regSuccess && (
              <div className="bg-green-50 text-green-600 text-sm p-2 rounded text-center">
                {regSuccess}
              </div>
            )}

            <input
              type="text"
              placeholder="ชื่อผู้ใช้"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-green-500"
            />

            <input
              type="email"
              placeholder="อีเมล"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-green-500"
            />

            <input
              type="password"
              placeholder="รหัสผ่าน"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-green-500"
            />

            <select
              value={regRole}
              onChange={(e) => setRegRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-green-500"
            >
              <option value="buyer">ผู้ซื้อ</option>
              <option value="seller">ผู้ขาย</option>
            </select>

            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold">
              สมัครสมาชิก
            </button>
          </form>
        )}
      </div>

      {/* Under Card */}
      {tab === "login" && (
        <div className="text-center text-sm text-gray-600">
          ยังไม่มีบัญชีใช่ไหม?
          <span
            onClick={() => setTab("register")}
            className="text-blue-600 ml-1 font-medium hover:underline cursor-pointer"
          >
            สมัครสมาชิก
          </span>
        </div>
      )}

      {tab === "register" && (
        <div className="text-center text-sm text-gray-600">
          มีบัญชีอยู่แล้ว?
          <span
            onClick={() => setTab("login")}
            className="text-blue-600 ml-1 font-medium hover:underline cursor-pointer"
          >
            เข้าสู่ระบบ
          </span>
        </div>
      )}
    </div>
  </div>
);

}
