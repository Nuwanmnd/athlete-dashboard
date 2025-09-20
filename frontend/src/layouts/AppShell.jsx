import { NavLink, Outlet } from "react-router-dom";

export default function AppShell() {
  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="border-r border-base-border bg-base-card">
        <div className="px-5 py-4">
          <div className="text-lg font-semibold">Your Dashboard</div>
        </div>
        <nav className="px-2 space-y-1">
          {[
            { to: "/", label: "Home" },
            { to: "/athletes/new", label: "Add Athlete" },
            { to: "/assessments/new", label: "New Assessment" },
            { to: "/movement", label: "Movement Assessment" },
            { to: "/injury", label: "Injury & Recovery" },
          ].map((i) => (
            <NavLink
              key={i.to}
              to={i.to}
              className={({ isActive }) =>
                `block rounded-xl px-3 py-2 text-sm ${
                  isActive
                    ? "bg-brand text-brand-foreground"
                    : "text-base-text hover:bg-base-muted"
                }`
              }
            >
              {i.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-col">
        {/* Topbar */}
        <header className="h-14 border-b border-base-border bg-base-card flex items-center px-4">
          <div className="ml-auto">
            {/* theme toggle placeholder or user menu */}
          </div>
        </header>

        {/* Page content */}
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
