import { createContext, useContext, useState } from "react";

const USERS = [
  {
    role: "Admin",
    email: "admin@vit.edu.in",
    password: "admin@123",
    name: "Administrator",
    redirectTo: "/admin/dashboard",
  },
  {
    role: "HOD",
    email: "hod.inft@vit.edu.in",
    password: "hodinft@123",
    name: "HOD - Information Technology",
    department: "Information Technology",
    redirectTo: "/hod/dashboard",
  },
  {
    role: "Faculty",
    email: "omprakash.maurya@vit.edu.in",
    password: "omprakash@123",
    name: "Omprakash Maurya",
    department: "Information Technology",
    redirectTo: "/faculty/dashboard",
  },
];

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Rehydrate from sessionStorage so a page refresh keeps the user logged in.
  // sessionStorage is cleared automatically when the tab/browser is closed.
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem("vit_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (role, email, password) => {
    const match = USERS.find(
      (u) =>
        u.role === role &&
        u.email === email.trim().toLowerCase() &&
        u.password === password
    );
    if (match) {
      const { password: _, ...safeUser } = match;
      sessionStorage.setItem("vit_user", JSON.stringify(safeUser));
      setUser(safeUser);
      return { success: true, redirectTo: safeUser.redirectTo };
    }
    return { success: false };
  };

  const logout = () => {
    sessionStorage.removeItem("vit_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);