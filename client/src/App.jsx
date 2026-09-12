import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";
import AppShell from "./layouts/AppShell.jsx";
import Login from "./pages/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Courses from "./pages/Courses.jsx";
import Cohorts from "./pages/Cohorts.jsx";
import Users from "./pages/Users.jsx";

function RoleHome({ role }) {
  return (
    <section className="rounded-lg border border-app-border bg-app-panel p-6 shadow-sm">
      <h2 className="text-xl font-semibold">
        {role} Dashboard
      </h2>

      <p className="mt-2 text-sm leading-6 text-app-muted">
        You are logged in successfully as a {role}.
      </p>
    </section>
  );
}

function App() {
  const { isAuthenticated, user, logout } = useAuth();

  const defaultRoute = () => {
    if (!isAuthenticated || !user) {
      return "/login";
    }

    if (user.role === "ADMIN") {
      return "/admin";
    }

    if (user.role === "TRAINER") {
      return "/trainer";
    }

    if (user.role === "CANDIDATE") {
      return "/candidate";
    }

    return "/login";
  };

  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* Admin */}
      <Route element={<ProtectedRoute role="ADMIN" />}>
        <Route
          element={
            <AppShell
              user={user}
              onLogout={logout}
              title="Admin"
            />
          }
        >
          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={<RoleHome role="ADMIN" />}
          />

          {/* Courses */}
          <Route
            path="/courses"
            element={<Courses />}
          />

          {/* Cohorts */}
          <Route
            path="/cohorts"
            element={<Cohorts />}
          />

          {/* Users */}
          <Route
            path="/users"
            element={<Users />}
          />

          {/* Reports */}
          <Route
            path="/reports"
            element={
              <section className="rounded-lg border border-app-border bg-app-panel p-6">
                <h2 className="text-xl font-semibold">
                  Reports
                </h2>

                <p className="mt-2 text-sm text-app-muted">
                  Reports will be connected here.
                </p>
              </section>
            }
          />
        </Route>
      </Route>

      {/* Trainer */}
      <Route element={<ProtectedRoute role="TRAINER" />}>
        <Route
          element={
            <AppShell
              user={user}
              onLogout={logout}
              title="Trainer"
            />
          }
        >
          <Route
            path="/trainer"
            element={<RoleHome role="TRAINER" />}
          />
        </Route>
      </Route>

      {/* Candidate */}
      <Route element={<ProtectedRoute role="CANDIDATE" />}>
        <Route
          element={
            <AppShell
              user={user}
              onLogout={logout}
              title="Candidate"
            />
          }
        >
          <Route
            path="/candidate"
            element={<RoleHome role="CANDIDATE" />}
          />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route
        path="*"
        element={<Navigate to={defaultRoute()} replace />}
      />
    </Routes>
  );
}

export default App;