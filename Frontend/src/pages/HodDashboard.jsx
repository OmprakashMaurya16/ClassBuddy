<<<<<<< HEAD
import Sidebar from "../components/Sidebar";

const HodDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="ml-60 flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">HOD Dashboard</h1>
        <p className="text-gray-400 text-sm mb-6">Overview of department feedback and faculty performance.</p>
        
      </main>
=======
// HodDashboard.jsx
//
// API INTEGRATION POINTS:
//   GET /api/hod/stats
//     → { totalFaculty: number, deptAvgScore: number }
//
//   GET /api/hod/faculty?page=1&limit=12&search=<query>
//     → { faculty: [...], total: number, totalPages: number }
//     faculty shape: { _id, fullName, department, designation, role,
//                      avgRating, subjects: [{ name }] }
// 
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  BarChart2,
  Star,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import FacultyCard from "../components/FacultyCard";
import Pagination from "../components/Pagination";
import Footer from "../components/Footer";
import Header from "../components/Header";

// ── Constants 
const PAGE_SIZE = 12;

// ── Mock data — replace with API fetch 
const MOCK_STATS = { totalFaculty: 48, deptAvgScore: 4.82 };

const mk = (id, name, desig, subjects, rating) => ({
  _id: String(id),
  fullName: name,
  department: "INFT",
  role: "Faculty",
  designation: desig,
  avgRating: rating,
  subjects: subjects.map((s, i) => ({ _id: `s${id}${i}`, name: s })),
});

const MOCK_FACULTY = [
  mk(
    1,
    "Dr. Ananya Sharma",
    "Associate Professor",
    ["CC, Machine Learning, Data Feature Engineering"],
    4.9,
  ),
  mk(2, "Prof. Rahul Jha", "Head of Lab", ["Database Management Systems"], 4.7),
  mk(
    3,
    "Dr. Vikram Kapoor",
    "Assistant Professor",
    ["Artificial Intelligence"],
    4.8,
  ),
  mk(4, "Ms. Sneha Mehra", "Lecturer", ["Web Technologies"], 4.5),
  mk(5, "Dr. Arjun Mehta", "Senior Professor", ["Network Security"], 4.9),
  mk(
    6,
    "Ms. Priya Lakshmi",
    "Assistant Professor",
    ["Data Structures & Algo"],
    4.6,
  ),
  mk(
    7,
    "Mr. Rohan Tyagi",
    "Assistant Professor",
    ["Mobile App Development"],
    4.4,
  ),
  mk(8, "Dr. Sameer Verma", "Dean of Research", ["Machine Learning"], 5.0),
  mk(9, "Ms. Kavita Das", "Associate Professor", ["Software Engineering"], 4.7),
  mk(10, "Mr. Nitin Malhotra", "Lecturer", ["Cyber Laws & Ethics"], 4.8),
  mk(11, "Dr. Shalini Yadav", "Professor", ["Human Computer Interaction"], 4.9),
  mk(12, "Mr. Amit Bansal", "Assistant Professor", ["Operating Systems"], 4.6),
  mk(
    13,
    "Dr. Reena Kulkarni",
    "Senior Professor",
    ["Distributed Systems"],
    4.8,
  ),
  mk(14, "Ms. Pooja Nair", "Lecturer", ["Computer Graphics"], 4.3),
  mk(15, "Prof. Suresh Pai", "Professor", ["Theory of Computation"], 4.7),
  mk(16, "Dr. Kavya Iyer", "Assistant Professor", ["Advanced Algorithms"], 4.5),
];

// ── Star Rating display ───────────────────────────────────────────────────────
const RatingBadge = ({ rating }) => (
  <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-1">
    <Star size={11} className="text-indigo-500 fill-indigo-500" />
    <span
      className="font-bold text-indigo-700"
      style={{ fontSize: "clamp(0.68rem, 1.2vw, 0.78rem)" }}
    >
      {rating?.toFixed(1) ?? "—"}
    </span>
  </div>
);

// ── HOD-specific card wrapper: FacultyCard + rating badge + View Details btn ──
const HodFacultyCard = ({ faculty, onViewDetails }) => (
  <div className="relative flex flex-col">
    {/* Rating badge — overlaid top-right of the card */}
    <div className="absolute top-3 right-3 z-10">
      <RatingBadge rating={faculty.avgRating} />
    </div>

    {/* Base card — no admin action buttons */}
    <FacultyCard
      faculty={faculty}
      showActions={false}
      showViewDetails={true}
      onViewDetails={onViewDetails}
    />
  </div>
);

// ROOT
const HodDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState(MOCK_STATS);
  const [allFaculty, setAllFaculty] = useState(MOCK_FACULTY);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // ── API INTEGRATION ────────────────────────────────────────────────────────
  // Replace mock state above with:
  //
  //   useEffect(() => {
  //     const token = JSON.parse(sessionStorage.getItem("vit_user") ?? "{}")?.token;
  //     fetch("/api/hod/stats",  { headers: { Authorization: `Bearer ${token}` } })
  //       .then(r => r.json()).then(setStats);
  //   }, []);
  //
  //   useEffect(() => {
  //     setLoading(true);
  //     const token  = JSON.parse(sessionStorage.getItem("vit_user") ?? "{}")?.token;
  //     const params = new URLSearchParams({ page, limit: PAGE_SIZE });
  //     if (search) params.set("search", search);
  //     fetch(`/api/hod/faculty?${params}`, { headers: { Authorization: `Bearer ${token}` } })
  //       .then(r => r.json())
  //       .then(d => { setAllFaculty(d.faculty); })
  //       .finally(() => setLoading(false));
  //   }, [page, search]);
  // ──────────────────────────────────────────────────────────────────────────

  // Client-side filter (remove when using server-side search)
  const filtered = allFaculty.filter(
    (f) => !search || f.fullName.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  // Navigate to FacultyAnalytics with HOD context
  // Route: /hod/faculty/:id/analytics
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

      {/*  MAIN  */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1
            className="font-bold text-gray-600 leading-tight"
            style={{ fontSize: "clamp(1.3rem,3vw,1.75rem)" }}
          >
            Department of {user?.department ?? "Information Technology"}
          </h1>
          <p
            className="text-gray-400 mt-1"
            style={{ fontSize: "clamp(0.78rem, 1.5vw, 0.9rem)" }}
          >
            Academic Year {new Date().getFullYear()}-
            {new Date().getFullYear() + 1}
          </p>
        </div>

        {/*  Stats + Search row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Total Faculty stat */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Users size={22} className="text-indigo-500" />
            </div>
            <div>
              <p
                className="font-semibold uppercase tracking-wider text-gray-400"
                style={{ fontSize: "clamp(0.6rem, 1.1vw, 0.68rem)" }}
              >
                TOTAL FACULTY
              </p>
              <p
                className="font-bold text-gray-600 leading-tight"
                style={{ fontSize: "clamp(1rem,2vw,1.5rem)" }}
              >
                {loading ? "—" : `${stats.totalFaculty} Members`}
              </p>
            </div>
          </div>

          {/* Dept Avg Score stat */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <BarChart2 size={22} className="text-indigo-500" />
            </div>
            <div>
              <p
                className="font-semibold uppercase tracking-wider text-gray-400"
                style={{ fontSize: "clamp(0.6rem, 1.1vw, 0.68rem)" }}
              >
                DEPT AVG SCORE
              </p>
              <p
                className="font-bold text-gray-600 leading-tight"
                style={{ fontSize: "clamp(1rem,2vw,1.5rem)" }}
              >
                {loading ? "—" : `${stats.deptAvgScore} / 5.0`}
              </p>
            </div>
          </div>

          {/* Search */}
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

        {/*  Faculty Grid  */}
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
              style={{ fontSize: "clamp(0.85rem, 1.8vw, 1rem)" }}
            >
              No faculty found
            </p>
            <p
              className="mt-1"
              style={{ fontSize: "clamp(0.72rem, 1.4vw, 0.85rem)" }}
            >
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

        {/*  Pagination + count */}
        {!loading && filtered.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Showing X of Y */}
            <p
              className="text-gray-400 order-2 sm:order-1"
              style={{ fontSize: "clamp(0.72rem, 1.4vw, 0.82rem)" }}
            >
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
>>>>>>> frontend
    </div>
  );
};

<<<<<<< HEAD
export default HodDashboard;
=======
export default HodDashboard;
>>>>>>> frontend
