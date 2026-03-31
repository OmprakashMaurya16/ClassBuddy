import { useState } from "react";
import { Users, LogOut, Menu, X, LayoutDashboard } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import logo from "../assets/vit.png";

const NAV = {
  Admin: [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={17} />,
      path: "/admin/dashboard",
    },
    {
      label: "Manage Faculty",
      icon: <Users size={17} />,
      path: "/admin/manage-faculty",
    },
  ],
};

const AVATAR = {
  Admin: { letter: "AD", bg: "bg-orange-100", text: "text-orange-700" },
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const navItems = NAV[user.role] ?? [];
  const avatar = AVATAR[user.role] ?? AVATAR.Admin;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };
  const handleNav = (path) => {
    navigate(path);
    setOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <img src={logo} alt="College Logo" className="w-36 h-15 object-cover" />
        <span
          className="font-bold text-[#170a89]"
          style={{ fontSize: "clamp(0.9rem, 1.8vw, 1.05rem)" }}>
          ClassEcho
        </span>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => handleNav(item.path)}
              className={`flex items-center w-full gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors duration-150 cursor-pointer ${
                active
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
              style={{ fontSize: "clamp(0.78rem, 1.6vw, 0.875rem)" }}>
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-gray-100">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <span
            className={`inline-flex items-center justify-center w-9 h-9 rounded-full font-bold shrink-0 ${avatar.bg} ${avatar.text}`}
            style={{ fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)" }}>
            {avatar.letter}
          </span>
          <div className="flex flex-col min-w-0">
            <span
              className="font-semibold text-gray-800 truncate"
              style={{ fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)" }}>
              {user.name}
            </span>
            <span
              className="text-gray-400 truncate"
              style={{ fontSize: "clamp(0.65rem, 1.3vw, 0.75rem)" }}>
              {user.department
                ? `${user.role} · ${user.department}`
                : user.role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-6 py-3 text-gray-500 hover:text-red-500 hover:bg-gray-50 transition-colors cursor-pointer"
          style={{ fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)" }}>
          <LogOut size={15} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-xl shadow-md border border-gray-100 text-gray-600 hover:bg-gray-50 transition">
        <Menu size={20} />
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside
            className="relative flex flex-col bg-white shadow-2xl z-50"
            style={{ width: "clamp(220px, 70vw, 260px)" }}>
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
              <X size={17} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <aside
        className="hidden lg:flex flex-col fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-30 overflow-hidden"
        style={{ width: "clamp(200px, 15vw, 240px)" }}>
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
