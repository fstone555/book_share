import Navbar from "../Navbar/Navbar";
import { Outlet } from "react-router-dom";

export default function BuyerLayout() {
  return (
    <>
      <Navbar />
      <main >
        <Outlet />
      </main>
    </>
  );
}
