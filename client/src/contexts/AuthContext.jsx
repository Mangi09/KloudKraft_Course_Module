import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");

    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const login = async (email, password) => {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error?.message ||
        data?.message ||
        "Login failed"
      );
    }

    if (!data.token) {
      throw new Error("Login response did not contain a token");
    }

    if (!data.user) {
      throw new Error("Login response did not contain user information");
    }

    // Store JWT
    localStorage.setItem("token", data.token);

    // Backend already returns the complete user object
    const userData = data.user;

    // Store user information
    localStorage.setItem("user", JSON.stringify(userData));

    // Update React state
    setToken(data.token);
    setUser(userData);

    return userData;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    login,
    logout,
    isAuthenticated: Boolean(token),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}