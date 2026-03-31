import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";
import HodDashboard from "./pages/HodDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import ManageFaculty from "./pages/ManageFaculty";
import GenerateQR from "./pages/GenerateQR";
import FacultyAnalytics from "./pages/FacultyAnalytics";

const PublicRoute = () => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={user.redirectTo} replace />;
  }
  return <Outlet />;
};

const App = () => (
  <div>
    <AuthProvider>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* ── Public feedback form (accessible via QR code) ── */}
          <Route path="/feedback" element={<FeedbackForm />} />
        </Route>

        <Route element={<ProtectedRoute allowedRole="Admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/manage-faculty" element={<ManageFaculty />} />
        </Route>

        <Route element={<ProtectedRoute allowedRole="HOD" />}>
          <Route path="/hod/dashboard" element={<HodDashboard />} />
          <Route
            path="/hod/faculty/:id/analytics"
            element={<FacultyAnalytics />}
          />
        </Route>

        <Route element={<ProtectedRoute allowedRole="Faculty" />}>
          <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
          <Route path="/faculty/generate-qr" element={<GenerateQR />} />
          <Route path="/faculty/analytics" element={<FacultyAnalytics />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  </div>
);

export default App;
