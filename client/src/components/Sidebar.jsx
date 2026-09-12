import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  BarChart3,
  Users,
  GraduationCap,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/courses", label: "Courses", icon: LayoutGrid },
  { to: "/cohorts", label: "Cohorts", icon: GraduationCap },
  { to: "/users", label: "Users", icon: Users },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

export default function Sidebar({ user, onLogout }) {
  return (
    <aside className="flex h-screen w-[280px] flex-col border-r border-app-border bg-app-panel">
      <div className="px-6 py-6">
        <span className="font-serif text-2xl font-bold text-red-600">
          LabsKraft
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-app-primary text-white"
                  : "text-app-text hover:bg-app-border"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center justify-between border-t border-app-border px-4 py-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {user?.username}
          </p>

          <p className="truncate text-xs text-app-muted">
            {user?.role}
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="rounded-md p-2 text-app-muted hover:bg-app-border hover:text-app-text"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}