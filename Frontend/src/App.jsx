import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import Login            from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard   from "./pages/AdminDashboard";
import HodDashboard     from "./pages/HodDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import ManageFaculty from "./pages/ManageFaculty";

/**
 * PublicRoute — guards /login and /
 * If user is already logged in, send them straight to their dashboard.
 * Pressing the browser Back button from a dashboard will also hit this
 * and bounce them forward again, so they can never land on login while
 * still authenticated.
 */
const PublicRoute = () => {
  const { user } = useAuth();
  if (user) {
    // Already logged in → go to their dashboard (replace so Back doesn't loop)
    return <Navigate to={user.redirectTo} replace />;
  }
  return <Outlet />;
};

const App = () => (
  <div>
    <AuthProvider>
      <Routes>
        {/* ── Public (login) — redirect away if already authenticated ── */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/"      element={<Navigate to="/login" replace />} />
        </Route>

        {/* ── Admin ── */}
        <Route element={<ProtectedRoute allowedRole="Admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/manage-faculty" element={<ManageFaculty />} />
        </Route>

        {/* ── HOD ── */}
        <Route element={<ProtectedRoute allowedRole="HOD" />}>
          <Route path="/hod/dashboard" element={<HodDashboard />} />
        </Route>

        {/* ── Faculty ── */}
        <Route element={<ProtectedRoute allowedRole="Faculty" />}>
          <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        </Route>

        {/* 404 → login (ProtectedRoute will redirect to dashboard if logged in) */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  </div>
);

export default App;