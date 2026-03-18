import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Upload, FileText, Shield } from "lucide-react";

const commonLinks = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Audit Trail", path: "/audit", icon: Shield },
];

const governmentLinks = [
  { name: "Upload Tender", path: "/upload-tender", icon: Upload },
];

const vendorLinks = [
  { name: "Submit Bid", path: "/upload-vendor", icon: FileText },
];

export default function Sidebar() {
  const { role } = useAuth();

  const links =
    role === "government"
      ? [...commonLinks, ...governmentLinks]
      : [...commonLinks, ...vendorLinks];

  return (
    <aside className="w-64 bg-white border-r border-slate-200">
      <div className="p-4">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-4 px-3">
          Navigation
        </p>
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
