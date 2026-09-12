import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/cohorts";

function getToken() {
  return localStorage.getItem("token");
}

export default function Cohorts() {
  const [cohorts, setCohorts] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function fetchCohorts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message || "Failed to load cohorts."
        );
      }

      setCohorts(data.cohorts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCohorts();
  }, []);

  async function handleCreate(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Cohort name is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message || "Failed to create cohort."
        );
      }

      setName("");
      setDescription("");

      await fetchCohorts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this cohort?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message || "Failed to delete cohort."
        );
      }

      await fetchCohorts();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Cohort Management</h1>
          <p style={styles.subtitle}>
            Create and manage student cohorts.
          </p>
        </div>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Create Cohort</h2>

        <form onSubmit={handleCreate}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Cohort Name</label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter cohort name"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Enter cohort description"
              rows="4"
              style={styles.textarea}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={styles.primaryButton}
          >
            {submitting ? "Creating..." : "Create Cohort"}
          </button>
        </form>
      </div>

      <div style={styles.card}>
        <div style={styles.listHeader}>
          <h2 style={styles.cardTitle}>Cohorts</h2>

          <button
            type="button"
            onClick={fetchCohorts}
            style={styles.secondaryButton}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading cohorts...</p>
        ) : cohorts.length === 0 ? (
          <p style={styles.empty}>
            No cohorts found.
          </p>
        ) : (
          <div style={styles.list}>
            {cohorts.map((cohort) => (
              <div
                key={cohort.id}
                style={styles.cohortItem}
              >
                <div style={styles.cohortInfo}>
                  <h3 style={styles.cohortName}>
                    {cohort.name}
                  </h3>

                  <p style={styles.cohortDescription}>
                    {cohort.description || "No description"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(cohort.id)}
                  style={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "32px",
    maxWidth: "1000px",
    margin: "0 auto",
  },

  header: {
    marginBottom: "24px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: "700",
  },

  subtitle: {
    marginTop: "8px",
    color: "#6b7280",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
  },

  cardTitle: {
    marginTop: 0,
    marginBottom: "20px",
    fontSize: "20px",
  },

  formGroup: {
    marginBottom: "18px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    resize: "vertical",
  },

  primaryButton: {
    padding: "11px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#111827",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "600",
  },

  secondaryButton: {
    padding: "9px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    background: "#ffffff",
    cursor: "pointer",
  },

  deleteButton: {
    padding: "9px 14px",
    border: "none",
    borderRadius: "8px",
    background: "#dc2626",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "600",
  },

  error: {
    padding: "12px 16px",
    marginBottom: "20px",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#991b1b",
  },

  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  cohortItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    padding: "16px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
  },

  cohortInfo: {
    flex: 1,
  },

  cohortName: {
    margin: 0,
    fontSize: "17px",
  },

  cohortDescription: {
    margin: "6px 0 0",
    color: "#6b7280",
  },

  empty: {
    color: "#6b7280",
  },
};