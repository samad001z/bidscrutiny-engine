import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "@/context/AuthContext";

export default function Layout() {
  const { role } = useAuth();

  if (!role) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
