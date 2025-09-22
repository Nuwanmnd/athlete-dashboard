// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  ClipboardPlus,
  Activity,
  List,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Add Athlete", path: "/add-athlete", icon: UserPlus },
  { label: "New Assessment", path: "/assessments/new", icon: ClipboardPlus },
  {
    label: "Movement Assessment",
    path: "/athletes/1/movement-assessment",
    icon: ClipboardPlus,
  },
  { label: "Injury Page", path: "/athletes/1/injury", icon: Activity },
  { label: "Athlete List", path: "/athletes-list", icon: List },
];

async function handleLogout() {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include", // send cookie
    });
  } catch (_) {
    // ignore; we redirect regardless
  } finally {
    window.location.href = "/login";
  }
}

function Sidebar() {
  return (
    <aside
      className="
        fixed left-0 top-0 z-30 h-screen w-64
        border-r border-base-border bg-base-card
        text-base-text
        flex flex-col
      "
    >
      {/* Brand */}
      <div className="h-16 px-5 flex items-center border-b border-base-border">
        <span className="text-lg font-semibold tracking-tight">
          T A G Dashboard
        </span>
      </div>

      {/* Nav */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              [
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm no-underline transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
                isActive
                  ? "bg-base-muted/60 text-base-text font-medium ring-1 ring-brand/20"
                  : "text-base-subtle hover:text-base-text hover:bg-base-muted/40",
              ].join(" ")
            }
          >
            <Icon
              size={18}
              className="shrink-0 opacity-70 group-hover:opacity-100"
            />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer: Logout */}
      <div className="p-3 border-t border-base-border">
        <button
          type="button"
          onClick={handleLogout}
          className="
            w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm
            text-base-subtle hover:text-base-text hover:bg-base-muted/40
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40
            transition
          "
        >
          <LogOut size={18} className="shrink-0 opacity-70" />
          <span className="truncate">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
