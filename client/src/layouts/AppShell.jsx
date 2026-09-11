import { Outlet, useOutletContext } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";

export default function AppShell({ user, onLogout, title }) {
  return (
    <div className="flex min-h-screen bg-app-bg text-app-text">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="flex-1 overflow-y-auto p-6">
        <Header title={title} />
        <main className="mt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}