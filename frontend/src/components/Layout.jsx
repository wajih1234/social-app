import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <LeftSidebar />
      <RightSidebar />
      <main className="pt-14 lg:px-64">
        <div className="max-w-xl mx-auto p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}