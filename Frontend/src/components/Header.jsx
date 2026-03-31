import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import logo from "../assets/vit.png";

const Header = ({ initials = "U" }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">

          {/* Left: Logo */}
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <img
              src={logo}
              alt="College Logo"
              className="w-16 sm:w-20 md:w-24 lg:w-32 shrink-0 h-auto object-contain"
            />

            <span className="font-bold text-[#170a89] text-lg sm:text-xl md:text-2xl lg:text-3xl truncate">
              ClassEcho
            </span>
          </div>

          {/* Right: Profile + Logout */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs sm:text-sm">
              {initials}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-500 hover:text-red-500 hover:bg-gray-50 rounded-lg transition cursor-pointer"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;