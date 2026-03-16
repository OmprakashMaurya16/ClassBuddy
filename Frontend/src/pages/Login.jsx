import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  GraduationCap, Lock, User, Eye, EyeOff, AlertCircle,
} from "lucide-react";
import Footer from "../components/Footer";

const Login = () => {
  const [role,         setRole]         = useState("Admin");
  const [showPassword, setShowPassword] = useState(false);
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [error,        setError]        = useState("");

  const { login }   = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();
  const roles       = ["Admin", "HOD", "Faculty"];

  const handleRoleSwitch = (r) => {
    setRole(r);
    setError("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    const result = login(role, email, password);

    if (result.success) {
      const intended = location.state?.from?.pathname;
      navigate(intended || result.redirectTo, { replace: true });
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-8">
      <div className="flex-col mt-6">

        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <div className="bg-blue-100 p-3 rounded-lg">
              <GraduationCap color="#2563EB" />
            </div>
          </div>
          <h1 className="text-xl font-bold">
            Vidyalankar Institute of Technology
          </h1>
          <p className="text-gray-500 text-sm">Feedback Portal System</p>
        </div>
        
        <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">

          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold">Log in to your account</h2>
            <p className="text-gray-500 text-sm">Please select your role to continue</p>
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
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="text-sm font-medium text-gray-700">
                Institute ID / Email
              </label>
              <div className="relative mt-1">
                <User size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your Email"
                  className="w-full py-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-lg pr-3 focus:outline-none focus:border-0 focus:ring focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative mt-1">
                <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full py-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-lg pr-3 focus:outline-none focus:border-0 focus:ring focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 cursor-pointer text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="text-right mt-1">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg cursor-pointer font-medium hover:opacity-90 transition"
            >
              Secure Login
            </button>
          </form>

          <div className="text-center text-sm text-gray-500 mt-6">
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