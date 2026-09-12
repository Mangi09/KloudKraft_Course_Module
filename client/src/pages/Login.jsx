import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && user) {
    if (user.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }

    if (user.role === "TRAINER") {
      return <Navigate to="/trainer" replace />;
    }

    if (user.role === "CANDIDATE") {
      return <Navigate to="/candidate" replace />;
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);

      if (loggedInUser.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else if (loggedInUser.role === "TRAINER") {
        navigate("/trainer", { replace: true });
      } else if (loggedInUser.role === "CANDIDATE") {
        navigate("/candidate", { replace: true });
      } else {
        setError("Unknown user role.");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-app-bg text-app-text flex items-center justify-center px-6">
      <section className="w-full max-w-md">
        <div className="rounded-xl border border-app-border bg-app-panel p-8 shadow-sm">
          <div className="mb-8 text-center">
            <p className="text-sm font-medium text-app-primary">LabsKraft</p>

            <h1 className="mt-2 text-3xl font-semibold">
              Course Module
            </h1>

            <p className="mt-2 text-sm text-app-muted">
              Sign in to continue
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-md border border-status-danger px-4 py-3 text-sm text-status-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                required
                className="w-full rounded-md border border-app-border bg-app-bg px-4 py-3 text-sm outline-none transition focus:border-app-primary"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-md border border-app-border bg-app-bg px-4 py-3 text-sm outline-none transition focus:border-app-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-app-primary px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Login;