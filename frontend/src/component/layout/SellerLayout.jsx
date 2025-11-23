import Navbar from "../Navbar/Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function SellerLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "seller") {
      navigate("/"); // redirect ออก
    }
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "70px" }}>
        <Outlet />
      </main>
    </>
  );
}
