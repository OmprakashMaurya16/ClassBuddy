<<<<<<< HEAD
import Sidebar from "../components/Sidebar";

const FacultyDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="ml-60 flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Faculty Dashboard</h1>
        <p className="text-gray-400 text-sm mb-6">View your subjects, ratings, and student feedback.</p>
        
      </main>
=======
// API INTEGRATION POINTS:
//   GET /api/faculty/profile        → { name, department, designation }
//   GET /api/faculty/sessions/recent → { sessions: [{ _id, date, subject, section, responses, status }] }
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, QrCode, BarChart2, History } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import Footer from "../components/Footer";
import ActionCard from "../components/ActionCard";
import Header from "../components/Header";

// ── Mock recent sessions ──────────────────────────────────────────────────────
// Replace with: fetch("/api/faculty/sessions/recent") → setRecentSessions(data.sessions)
const MOCK_SESSIONS = [
  {
    _id: "s1",
    date: "Oct 24, 2023",
    subject: "Structural Analysis II",
    section: "A",
    responses: 42,
    status: "Completed",
  },
  {
    _id: "s2",
    date: "Oct 22, 2023",
    subject: "Fluid Mechanics Lab",
    section: "B",
    responses: 18,
    status: "Completed",
  },
  {
    _id: "s3",
    date: "Oct 19, 2023",
    subject: "Thermodynamics",
    section: "A",
    responses: 35,
    status: "Completed",
  },
];

const StatusBadge = ({ status }) => {
  const map = {
    Completed: "bg-green-50 text-green-600 border-green-200",
    Active: "bg-blue-50 text-blue-600 border-blue-200",
    Pending: "bg-yellow-50 text-yellow-600 border-yellow-200",
  };
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${map[status] ?? "bg-gray-50 text-gray-500 border-gray-200"}`}
    >
      {status}
    </span>
  );
};

const FacultyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // API INTEGRATION: replace mock with real fetch
  const [recentSessions, setRecentSessions] = useState(MOCK_SESSIONS);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const token = JSON.parse(sessionStorage.getItem("vit_user") ?? "{}")?.token;
  //   fetch("/api/faculty/sessions/recent", { headers: { Authorization: `Bearer ${token}` } })
  //     .then(r => r.json()).then(d => setRecentSessions(d.sessions));
  // }, []);

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
    <div className="min-h-screen bg-gray-50">
      <Header initials={initials} />

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Welcome section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p
              className="font-semibold uppercase tracking-widest text-gray-400 mb-1"
              style={{ fontSize: "clamp(0.6rem, 1.2vw, 0.7rem)" }}
            >
              FACULTY PORTAL
            </p>
            <h1
              className="font-bold text-gray-600 leading-tight"
              style={{ fontSize: "clamp(1.3rem,3vw,1.75rem)" }}
            >
              Welcome, {user?.name ?? "Faculty"}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <GraduationCap size={16} className="text-gray-400" />
              <span
                className="text-gray-500"
                style={{ fontSize: "clamp(0.78rem, 1.5vw, 0.9rem)" }}
              >
                Department of {user?.department ?? "—"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Two action cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          <ActionCard
            title="Collect Feedback"
            description="Generate a unique QR code for your current lecture session. Students can scan it instantly to provide anonymous feedback."
            icon={QrCode}
            buttonText="Generate New QR Code"
            onClick={() => navigate("/faculty/generate-qr")}
            bgGradient="from-blue-50 to-blue-100"
            iconColor="text-blue-600"
            buttonStyle="bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200"
          />

          <ActionCard
            title="Review Insights"
            description="Access your analytics dashboard to see rating trends, read student comments, and download semester reports."
            icon={BarChart2}
            buttonText="View Dashboard"
            onClick={() => navigate("/faculty/analytics")}
            bgGradient="from-emerald-50 to-green-100"
            iconColor="text-emerald-600"
            buttonStyle="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          />
        </div>

        {/* ── Recent Sessions ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-50 flex items-center gap-2.5">
            <History size={17} className="text-gray-400" />
            <h3
              className="font-bold text-gray-800"
              style={{ fontSize: "clamp(0.9rem, 1.8vw, 1.05rem)" }}
            >
              Recent Sessions
            </h3>
          </div>

          {/* Table header */}
          <div className="hidden sm:grid grid-cols-4 px-5 sm:px-6 py-3 bg-gray-50 border-b border-gray-100">
            {["DATE", "COURSE", "RESPONSES", "STATUS"].map((h) => (
              <span
                key={h}
                className="font-semibold text-gray-400 uppercase tracking-wider"
                style={{ fontSize: "clamp(0.6rem, 1.1vw, 0.68rem)" }}
              >
                {h}
              </span>
            ))}
          </div>

          {loading ? (
            <div className="divide-y divide-gray-50">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="px-5 sm:px-6 py-4 grid grid-cols-4 gap-4"
                >
                  {[1, 2, 3, 4].map((j) => (
                    <div
                      key={j}
                      className="h-4 bg-gray-100 rounded animate-pulse"
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : recentSessions.length === 0 ? (
            <div className="flex flex-col items-center py-14 text-gray-300">
              <History size={32} className="mb-2" />
              <p style={{ fontSize: "clamp(0.78rem, 1.5vw, 0.875rem)" }}>
                No sessions yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentSessions.map((s) => (
                <div
                  key={s._id}
                  className="px-5 sm:px-6 py-4 flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4 hover:bg-gray-50 transition"
                >
                  {/* Mobile label layout */}
                  <div className="sm:hidden flex justify-between items-center">
                    <span
                      className="font-semibold text-gray-800"
                      style={{ fontSize: "clamp(0.78rem, 1.5vw, 0.875rem)" }}
                    >
                      {s.subject}
                    </span>
                    <StatusBadge status={s.status} />
                  </div>
                  <div
                    className="sm:hidden flex justify-between text-gray-400"
                    style={{ fontSize: "clamp(0.68rem, 1.3vw, 0.78rem)" }}
                  >
                    <span>{s.date}</span>
                    <span>{s.responses} responses</span>
                  </div>
                  {/* Desktop row */}
                  <span
                    className="hidden sm:block font-semibold text-gray-700"
                    style={{ fontSize: "clamp(0.78rem, 1.5vw, 0.875rem)" }}
                  >
                    {s.date}
                  </span>
                  <span
                    className="hidden sm:block text-gray-700"
                    style={{ fontSize: "clamp(0.78rem, 1.5vw, 0.875rem)" }}
                  >
                    {s.subject}
                  </span>
                  <span
                    className="hidden sm:block text-gray-600"
                    style={{ fontSize: "clamp(0.78rem, 1.5vw, 0.875rem)" }}
                  >
                    {s.responses}
                  </span>
                  <div className="hidden sm:flex">
                    <StatusBadge status={s.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
>>>>>>> frontend
    </div>
  );
};

<<<<<<< HEAD
export default FacultyDashboard;
=======
export default FacultyDashboard;
>>>>>>> frontend
