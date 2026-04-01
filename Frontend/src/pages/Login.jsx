import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  GraduationCap,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import Footer from "../components/Footer";

const Login = () => {
  const [role, setRole] = useState("Admin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const roles = ["Admin", "HOD", "Faculty"];

  const handleRoleSwitch = (r) => {
    setRole(r);
    setError("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const result = await login(role, email, password);
    setLoading(false);

    if (result.success) {
      const intended = location.state?.from?.pathname;
      navigate(intended || result.redirectTo, { replace: true });
    } else {
      setError(
        result.message || "Invalid email or password. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-8 sm:px-6 lg:px-8">
      <div className="w-full" style={{ maxWidth: "min(25rem, 75vw)" }}>
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <div className="bg-blue-100 p-3 rounded-lg">
              <GraduationCap color="#2563EB" />
            </div>
          </div>

          <h1
            className="font-bold text-gray-800 leading-tight"
            style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }}>
            Vidyalankar Institute of Technology
          </h1>

          <p
            className="text-gray-500 text-sm"
            style={{ fontSize: "clamp(0.75rem, 1.8vw, 0.875rem)" }}>
            Feedback Portal System
          </p>
        </div>

        <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8 sm:p-8">
          <div className="text-center mb-4">
            <h2
              className="text-lg font-semibold"
              style={{ fontSize: "clamp(0.95rem, 2.2vw, 1.125rem)" }}>
              Log in to your account
            </h2>
            <p
              className="text-gray-500 text-sm"
              style={{ fontSize: "clamp(0.72rem, 1.6vw, 0.875rem)" }}>
              Please select your role to continue
            </p>
          </div>

          <div className="grid grid-cols-3 bg-gray-100 rounded-lg p-1 mb-6">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => handleRoleSwitch(r)}
                className={`text-sm py-2 rounded-md transition-colors duration-300 cursor-pointer ${
                  role === r
                    ? "bg-white shadow text-blue-600"
                    : "text-gray-500 hover:text-blue-600"
                }`}
                style={{ fontSize: "clamp(0.72rem, 1.6vw, 0.875rem)" }}>
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="text-sm font-medium text-gray-700"
                style={{ fontSize: "clamp(0.72rem, 1.6vw, 0.875rem)" }}>
                Institute ID / Email
              </label>
              <div className="relative mt-1">
                <User
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your Email"
                  disabled={loading}
                  className="w-full py-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-lg pr-3 focus:outline-none focus:border-0 focus:ring focus:ring-blue-500"
                  style={{ fontSize: "clamp(0.72rem, 1.6vw, 0.875rem)" }}
                />
              </div>
            </div>

            <div>
              <label
                className="text-sm font-medium text-gray-700"
                style={{ fontSize: "clamp(0.72rem, 1.6vw, 0.875rem)" }}>
                Password
              </label>
              <div className="relative mt-1">
                <Lock
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  className="w-full py-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-lg pr-3 focus:outline-none focus:border-0 focus:ring focus:ring-blue-500"
                  style={{ fontSize: "clamp(0.72rem, 1.6vw, 0.875rem)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 cursor-pointer text-gray-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="text-right mt-1">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-blue-600 hover:underline"
                  style={{ fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)" }}>
                  Forgot Password?
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg cursor-pointer font-medium hover:opacity-90 transition"
              style={{ fontSize: "clamp(0.8rem, 1.8vw, 0.9rem)" }}>
              {loading ? "Signing in..." : "Secure Login"}
            </button>
          </form>

          <div
            className="text-center text-sm text-gray-500 mt-6"
            style={{ fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)" }}>
            Need help logging in?{" "}
            <span className="text-blue-600 cursor-pointer hover:underline">
              Contact IT Support
            </span>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Login;
