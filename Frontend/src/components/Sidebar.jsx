import { Users, User, Plus, LogOut, GraduationCap } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// Nav items per role
const NAV = {
  Admin: [
    { label: "Dashboard",      icon: <Users size={18} />, path: "/admin/dashboard" },
    { label: "Manage Faculty", icon: <User size={18} />,  path: "/admin/manage-faculty" },
  ],
  HOD: [
    { label: "Dashboard",        icon: <Users size={18} />, path: "/hod/dashboard" },
    { label: "Faculty Feedback", icon: <User size={18} />,  path: "/hod/feedback" },
  ],
  Faculty: [
    { label: "Dashboard",   icon: <Users size={18} />, path: "/faculty/dashboard" },
    { label: "My Feedback", icon: <User size={18} />,  path: "/faculty/feedback" },
  ],
};

// Avatar letter + colour per role
const AVATAR = {
  Admin:   { letter: "AD", bg: "bg-orange-100", text: "text-orange-700" },
  HOD:     { letter: "H", bg: "bg-emerald-100", text: "text-emerald-700" },
  Faculty: { letter: "F", bg: "bg-violet-100",  text: "text-violet-700" },
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Graceful fallback while auth loads
  if (!user) return null;

  const navItems = NAV[user.role] ?? [];
  const avatar   = AVATAR[user.role] ?? AVATAR.Admin;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="fixed top-0 left-0 flex flex-col h-screen w-60 bg-white border-r border-gray-200 overflow-hidden z-30">
      {/* Brand */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
        <div className="rounded-md bg-blue-100 p-2">
          <GraduationCap size={20} color="#2563EB" />
        </div>
        <span className="font-bold text-lg text-gray-800">Class Buddy</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center w-full gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-gray-100">
        <div className="px-4 py-4 flex items-center gap-3">
          <span
            className={`inline-flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm shrink-0 ${avatar.bg} ${avatar.text}`}
          >
            {avatar.letter}
          </span>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sm text-gray-800 truncate">{user.name}</span>
            <span className="text-xs text-gray-400 truncate">
              {user.department ? `${user.role} · ${user.department}` : user.role}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-6 py-3 text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;