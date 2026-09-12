import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [cohorts, setCohorts] = useState([]);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "CANDIDATE",
    cohort_id: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [usersResponse, cohortsResponse] = await Promise.all([
        fetch(`${API_BASE}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE}/cohorts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const usersData = await usersResponse.json();
      const cohortsData = await cohortsResponse.json();

      if (!usersResponse.ok) {
        throw new Error(
          usersData?.error?.message || "Failed to load users."
        );
      }

      if (!cohortsResponse.ok) {
        throw new Error(
          cohortsData?.error?.message || "Failed to load cohorts."
        );
      }

      setUsers(usersData.users || []);
      setCohorts(cohortsData.cohorts || []);
    } catch (err) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          role: form.role,
          cohort_id: form.cohort_id || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message || "Failed to create user."
        );
      }

      setSuccess("User created successfully.");

      setForm({
        username: "",
        email: "",
        password: "",
        role: "CANDIDATE",
        cohort_id: "",
      });

      await loadData();
    } catch (err) {
      setError(err.message || "Failed to create user.");
    } finally {
      setSubmitting(false);
    }
  }

  function getCohortName(cohortId) {
    if (!cohortId) {
      return "No cohort";
    }

    const cohort = cohorts.find(
      (item) => Number(item.id) === Number(cohortId)
    );

    return cohort ? cohort.name : `Cohort ${cohortId}`;
  }

  return (
    <div
      style={{
        padding: "28px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: "700",
            color: "#111827",
          }}
        >
          User Management
        </h1>

        <p
          style={{
            marginTop: "8px",
            color: "#6b7280",
            fontSize: "15px",
          }}
        >
          Create and manage users, roles, and cohort assignments.
        </p>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            borderRadius: "8px",
            background: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            borderRadius: "8px",
            background: "#dcfce7",
            color: "#166534",
            border: "1px solid #bbf7d0",
          }}
        >
          {success}
        </div>
      )}

      {/* Create User */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "28px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
            fontSize: "20px",
            color: "#111827",
          }}
        >
          Create User
        </h2>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "18px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Username
              </label>

              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter username"
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "11px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "7px",
                  fontSize: "14px",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "11px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "7px",
                  fontSize: "14px",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "11px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "7px",
                  fontSize: "14px",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Role
              </label>

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "11px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "7px",
                  fontSize: "14px",
                  background: "#ffffff",
                }}
              >
                <option value="CANDIDATE">CANDIDATE</option>
                <option value="TRAINER">TRAINER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Cohort
              </label>

              <select
                name="cohort_id"
                value={form.cohort_id}
                onChange={handleChange}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "11px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "7px",
                  fontSize: "14px",
                  background: "#ffffff",
                }}
              >
                <option value="">No cohort</option>

                {cohorts.map((cohort) => (
                  <option key={cohort.id} value={cohort.id}>
                    {cohort.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: "20px",
              padding: "11px 20px",
              border: "none",
              borderRadius: "7px",
              background: "#111827",
              color: "#ffffff",
              fontWeight: "600",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>

      {/* User List */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
            fontSize: "20px",
            color: "#111827",
          }}
        >
          Users
        </h2>

        {loading ? (
          <p style={{ color: "#6b7280" }}>Loading users...</p>
        ) : users.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No users found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "700px",
              }}
            >
              <thead>
                <tr>
                  <th style={headerStyle}>ID</th>
                  <th style={headerStyle}>Username</th>
                  <th style={headerStyle}>Email</th>
                  <th style={headerStyle}>Role</th>
                  <th style={headerStyle}>Cohort</th>
                  <th style={headerStyle}>Created</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td style={cellStyle}>{user.id}</td>

                    <td
                      style={{
                        ...cellStyle,
                        fontWeight: "600",
                      }}
                    >
                      {user.username}
                    </td>

                    <td style={cellStyle}>{user.email}</td>

                    <td style={cellStyle}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "5px 9px",
                          borderRadius: "999px",
                          background: "#f3f4f6",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td style={cellStyle}>
                      {getCohortName(user.cohort_id)}
                    </td>

                    <td style={cellStyle}>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const headerStyle = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "2px solid #e5e7eb",
  color: "#374151",
  fontSize: "13px",
  fontWeight: "700",
};

const cellStyle = {
  padding: "13px 12px",
  borderBottom: "1px solid #e5e7eb",
  color: "#4b5563",
  fontSize: "14px",
};