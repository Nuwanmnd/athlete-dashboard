// frontend/src/App.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";

export default function ProtectedLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 w-full bg-gray-100 min-h-screen p-6">
        <Outlet />
      </main>
    </div>
  );
}
