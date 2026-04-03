import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, BarChart2, Star, GraduationCap } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import FacultyCard from "../components/FacultyCard";
import Pagination from "../components/Pagination";
import Footer from "../components/Footer";
import Header from "../components/Header";

const PAGE_SIZE = 12;

const RatingBadge = ({ rating }) => (
  <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-1">
    <Star size={11} className="text-indigo-500 fill-indigo-500" />
    <span
      className="font-bold text-indigo-700"
      style={{ fontSize: "clamp(0.68rem, 1.2vw, 0.78rem)" }}>
      {rating?.toFixed(1) ?? "—"}
    </span>
  </div>
);

const HodFacultyCard = ({ faculty, onViewDetails }) => (
  <div className="relative flex flex-col h-full">
    <div className="absolute top-3 right-3 z-10">
      <RatingBadge rating={faculty.avgRating} />
    </div>

    <FacultyCard
      faculty={faculty}
      showActions={false}
      showViewDetails={true}
      onViewDetails={onViewDetails}
    />
  </div>
);

const HodDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalFaculty: 0, deptAvgScore: 0 });
  const [allFaculty, setAllFaculty] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const filtered = allFaculty.filter(
    (f) => !search || f.fullName.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user?.token) return;

      setLoading(true);
      try {
        const res = await fetch("/api/hod/dashboard", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
          credentials: "include",
        });

        const payload = await res.json();
        if (!res.ok) {
          setStats({ totalFaculty: 0, deptAvgScore: 0 });
          setAllFaculty([]);
          return;
        }

        const nextStats = payload?.data?.stats || {};
        const nextFaculty = Array.isArray(payload?.data?.faculties)
          ? payload.data.faculties
          : [];

        setStats({
          totalFaculty: Number(nextStats.totalFaculty || 0),
          deptAvgScore: Number(nextStats.deptAvgScore || 0),
        });
        setAllFaculty(nextFaculty);
      } catch {
        setStats({ totalFaculty: 0, deptAvgScore: 0 });
        setAllFaculty([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user?.token]);

  const handleViewDetails = (faculty) => {
    navigate(`/hod/faculty/${faculty._id}/analytics`);
  };

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .filter(
        (word) =>
          word && !["Dr.", "Prof.", "Mr.", "Mrs.", "Ms."].includes(word),
      )
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const initials = getInitials(user?.name);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header initials={initials} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1
            className="font-bold text-gray-600 leading-tight"
            style={{ fontSize: "clamp(1.3rem,3vw,1.75rem)" }}>
            Department of {user?.department ?? "Information Technology"}
          </h1>
          <p
            className="text-gray-400 mt-1"
            style={{ fontSize: "clamp(0.78rem, 1.5vw, 0.9rem)" }}>
            Academic Year {new Date().getFullYear()}-
            {new Date().getFullYear() + 1}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Users size={22} className="text-indigo-500" />
            </div>
            <div>
              <p
                className="font-semibold uppercase tracking-wider text-gray-400"
                style={{ fontSize: "clamp(0.6rem, 1.1vw, 0.68rem)" }}>
                TOTAL FACULTY
              </p>
              <p
                className="font-bold text-gray-600 leading-tight"
                style={{ fontSize: "clamp(1rem,2vw,1.5rem)" }}>
                {loading ? "—" : `${stats.totalFaculty} Members`}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <BarChart2 size={22} className="text-indigo-500" />
            </div>
            <div>
              <p
                className="font-semibold uppercase tracking-wider text-gray-400"
                style={{ fontSize: "clamp(0.6rem, 1.1vw, 0.68rem)" }}>
                DEPT AVG SCORE
              </p>
              <p
                className="font-bold text-gray-600 leading-tight"
                style={{ fontSize: "clamp(1rem,2vw,1.5rem)" }}>
                {loading ? "—" : `${stats.deptAvgScore} / 5.0`}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 sm:gap-3 h-10 sm:h-11">
            <Search size={17} className="text-gray-300 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search faculty members..."
              className="flex-1 bg-transparent focus:outline-none text-gray-700 placeholder-gray-300 min-w-0 text-sm sm:text-base"
              style={{ fontSize: "clamp(0.78rem, 1.5vw, 0.875rem)" }}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-52 rounded-2xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-300">
            <GraduationCap size={40} className="mb-3" />
            <p
              className="font-medium"
              style={{ fontSize: "clamp(0.85rem, 1.8vw, 1rem)" }}>
              No faculty found
            </p>
            <p
              className="mt-1"
              style={{ fontSize: "clamp(0.72rem, 1.4vw, 0.85rem)" }}>
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.map((f) => (
              <HodFacultyCard
                key={f._id}
                faculty={f}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p
              className="text-gray-400 order-2 sm:order-1"
              style={{ fontSize: "clamp(0.72rem, 1.4vw, 0.82rem)" }}>
              Showing{" "}
              <span className="font-bold text-gray-700">
                {paginated.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-700">{filtered.length}</span>{" "}
              faculty members
            </p>

            <div className="order-1 sm:order-2">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPage={(p) => {
                  if (p >= 1 && p <= totalPages) setPage(p);
                }}
              />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default HodDashboard;
