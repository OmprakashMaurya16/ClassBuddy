// ─────────────────────────────────────────────────────────────────────────────
// FacultyAnalytics.jsx — Performance Analytics dashboard
//
// API INTEGRATION POINTS:
//   GET /api/faculty/subjects
//     → { subjects: [{ _id, name, code }] }
//
//   GET /api/faculty/analytics?subjectId=<id|"overall">&filter=<weekly|monthly|semesterly>
//     → {
//         overallScore: number (out of 10),
//         trend:        [{ label, score, deptAvg }],
//         parameters:   [{ label, score, max }],
//         sentiment:    { positive, neutral, negative },   // percentages
//         comments:     [{ _id, text, sentiment, date, initials }]
//       }
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Star,
  MessageSquare,
  TrendingUp,
  BarChart2,
  LogOut,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import Footer from "../components/Footer";
import TimelineChart from "../components/TimelineChart";
import HBar from "../components/HBar";
import PieChart from "../components/PieChart";
import CommentCard from "../components/CommentCard";
import Header from "../components/Header";

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// Replace each usage of MOCK_* with your API fetch results.
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_SUBJECTS = [
  { _id: "overall", name: "Overall", code: "" },
  { _id: "sub1", name: "Thermodynamics II", code: "ME401" },
  { _id: "sub2", name: "Heat Transfer", code: "ME402" },
  { _id: "sub3", name: "Project Management", code: "ME403" },
];

const MOCK_ANALYTICS = {
  overall: {
    overallScore: 8.4,
    trend: [
      { label: "Week 1", score: 3.2, deptAvg: 3.0 },
      { label: "Week 3", score: 4.1, deptAvg: 3.5 },
      { label: "Week 5", score: 4.0, deptAvg: 3.7 },
      { label: "Week 7", score: 4.3, deptAvg: 3.8 },
      { label: "Week 9", score: 4.6, deptAvg: 4.0 },
      { label: "Week 12", score: 4.8, deptAvg: 4.1 },
    ],
    parameters: [
      { label: "Concept Clarity", score: 4.7, max: 5 },
      { label: "Lecture Structure", score: 4.3, max: 5 },
      { label: "Subject Mastery", score: 4.8, max: 5 },
      { label: "Practical Understanding", score: 4.2, max: 5 },
      { label: "Student Engagement", score: 4.0, max: 5 },
      { label: "Lecture Pace", score: 3.9, max: 5 },
      { label: "Learning Outcome Impact", score: 4.5, max: 5 },
    ],
    sentiment: { positive: 68, neutral: 22, negative: 10 },
    comments: [
      {
        _id: "c1",
        initials: "JD",
        text: "Dr. Sharma explains thermodynamics concepts very clearly. The practical examples help a lot in understanding.",
        sentiment: "Positive",
        date: "2 days ago",
      },
      {
        _id: "c2",
        initials: "AS",
        text: "The derivations are done a bit too quickly on the board. Would appreciate if we could slow down a bit.",
        sentiment: "Constructive",
        date: "4 days ago",
      },
      {
        _id: "c3",
        initials: "RK",
        text: "The PDF notes provided after class are excellent for revision.",
        sentiment: "Positive",
        date: "1 week ago",
      },
      {
        _id: "c4",
        initials: "PK",
        text: "Real-world examples make the concepts easy to relate to.",
        sentiment: "Positive",
        date: "1 week ago",
      },
      {
        _id: "c5",
        initials: "MM",
        text: "Sometimes the lecture runs over time. Better time management would help.",
        sentiment: "Constructive",
        date: "2 weeks ago",
      },
    ],
  },
  sub1: {
    overallScore: 9.1,
    trend: [
      { label: "Week 1", score: 4.0, deptAvg: 3.2 },
      { label: "Week 3", score: 4.4, deptAvg: 3.6 },
      { label: "Week 5", score: 4.5, deptAvg: 3.8 },
      { label: "Week 7", score: 4.7, deptAvg: 4.0 },
      { label: "Week 9", score: 4.8, deptAvg: 4.1 },
      { label: "Week 12", score: 4.9, deptAvg: 4.2 },
    ],
    parameters: [
      { label: "Concept Clarity", score: 4.9, max: 5 },
      { label: "Lecture Structure", score: 4.6, max: 5 },
      { label: "Subject Mastery", score: 5.0, max: 5 },
      { label: "Practical Understanding", score: 4.5, max: 5 },
      { label: "Student Engagement", score: 4.3, max: 5 },
      { label: "Lecture Pace", score: 4.1, max: 5 },
      { label: "Learning Outcome Impact", score: 4.7, max: 5 },
    ],
    sentiment: { positive: 78, neutral: 16, negative: 6 },
    comments: [
      {
        _id: "c1",
        initials: "JD",
        text: "Best thermodynamics lectures I've had. Very clear and methodical.",
        sentiment: "Positive",
        date: "1 day ago",
      },
      {
        _id: "c2",
        initials: "MN",
        text: "The worked examples really help to consolidate understanding.",
        sentiment: "Positive",
        date: "3 days ago",
      },
      {
        _id: "c3",
        initials: "AS",
        text: "Would love more practice problems in class.",
        sentiment: "Constructive",
        date: "5 days ago",
      },
      {
        _id: "c4",
        initials: "RR",
        text: "Excellent use of visual aids on the board.",
        sentiment: "Positive",
        date: "1 week ago",
      },
      {
        _id: "c5",
        initials: "LK",
        text: "Very approachable for questions after class.",
        sentiment: "Positive",
        date: "2 weeks ago",
      },
    ],
  },
};
["sub2", "sub3"].forEach((id) => {
  MOCK_ANALYTICS[id] = MOCK_ANALYTICS.overall;
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const getInitials = (name = "") =>
  name
    .split(" ")
    .filter((w) => w && !["Dr.", "Prof.", "Mr.", "Mrs.", "Ms."].includes(w))
    .map((w) => w[0])
    .join("")
    .toUpperCase();

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const FacultyAnalytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState(MOCK_SUBJECTS);
  const [activeSubj, setActiveSubj] = useState("overall");
  const [filter, setFilter] = useState("weekly");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // ── Fetch analytics whenever subject or filter changes ───────────────────
  // API INTEGRATION — replace the mock setTimeout below with:
  //
  //   const token = JSON.parse(sessionStorage.getItem("vit_user") ?? "{}")?.token;
  //   fetch(
  //     `/api/faculty/analytics?subjectId=${activeSubj}&filter=${filter}`,
  //     { headers: { Authorization: `Bearer ${token}` } }
  //   )
  //     .then((r) => r.json())
  //     .then(setAnalytics)
  //     .catch(console.error)
  //     .finally(() => setLoading(false));
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setAnalytics(MOCK_ANALYTICS[activeSubj] ?? MOCK_ANALYTICS.overall);
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [activeSubj, filter]);

  // ── Fetch subjects list on mount ─────────────────────────────────────────
  // API INTEGRATION — replace mock with:
  //
  //   useEffect(() => {
  //     const token = JSON.parse(sessionStorage.getItem("vit_user") ?? "{}")?.token;
  //     fetch("/api/faculty/subjects", { headers: { Authorization: `Bearer ${token}` } })
  //       .then((r) => r.json())
  //       .then((d) => setSubjects([{ _id: "overall", name: "Overall", code: "" }, ...d.subjects]));
  //   }, []);

  const activeSubjectLabel =
    subjects.find((s) => s._id === activeSubj)?.name ?? "Overall";

  const scorePercent = ((analytics?.overallScore ?? 0) / 10) * 100;

  const initials = getInitials(user?.name);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header initials={initials} />

      {/* ── PAGE CONTENT ─────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back + heading */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-gray-400 hover:text-blue-600 transition mb-2 cursor-pointer"
            style={{ fontSize: "clamp(0.72rem, 1.4vw, 0.8rem)" }}
          >
            <ChevronLeft size={14} /> Back
          </button>
          <h1
            className="font-bold text-gray-700"
            style={{ fontSize: "clamp(1.3rem, 3vw, 1.75rem)" }}
          >
            Performance Analytics
          </h1>
          <p
            className="text-gray-400 mt-0.5"
            style={{ fontSize: "clamp(0.72rem, 1.4vw, 0.8rem)" }}
          >
            {user?.department} · {new Date().getFullYear()}
          </p>
        </div>

        {/* ── Subject filter — horizontal scroll ─────────────────────── */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-2 mb-6"
          style={{ scrollbarWidth: "none" }}
        >
          {subjects.map((s) => (
            <button
              key={s._id}
              onClick={() => setActiveSubj(s._id)}
              className={`shrink-0 px-4 py-2 rounded-full font-medium transition border cursor-pointer ${
                activeSubj === s._id
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
              }`}
              style={{ fontSize: "clamp(0.75rem, 1.4vw, 0.875rem)" }}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* ── Main layout: left (80%) + right sidebar (20%) ────────────── */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* ══ LEFT COLUMN ══════════════════════════════════════════════ */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* 1. Trend chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={17} className="text-blue-600" />
                  <h2
                    className="font-bold text-gray-800"
                    style={{ fontSize: "clamp(0.9rem, 1.8vw, 1.05rem)" }}
                  >
                    Weekly Performance Trend
                  </h2>
                </div>

                {/* Filter pills */}
                <div className="flex gap-1.5">
                  {["weekly", "monthly", "semesterly"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1 rounded-lg font-medium capitalize transition cursor-pointer ${
                        filter === f
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                      style={{ fontSize: "clamp(0.65rem, 1.2vw, 0.75rem)" }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart legend */}
              <div className="flex gap-5 mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-0.5 bg-blue-600 rounded-full" />
                  <span
                    className="text-gray-500"
                    style={{ fontSize: "clamp(0.65rem, 1.2vw, 0.75rem)" }}
                  >
                    You
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 border-t-2 border-dashed border-gray-300" />
                  <span
                    className="text-gray-500"
                    style={{ fontSize: "clamp(0.65rem, 1.2vw, 0.75rem)" }}
                  >
                    Dept Avg
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="h-32 bg-gray-50 rounded-xl animate-pulse" />
              ) : (
                <TimelineChart data={analytics?.trend} />
              )}
            </div>

            {/* 2. Parameter bars (left) + Student Comments (right) ─────── */}
            {/*    CHANGED: comments moved here, pie chart moved to right sidebar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 2a. Parameter Analysis */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 size={17} className="text-blue-600" />
                  <h2
                    className="font-bold text-gray-800"
                    style={{ fontSize: "clamp(0.9rem, 1.8vw, 1.05rem)" }}
                  >
                    Parameter Analysis
                  </h2>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-6 bg-gray-100 rounded animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  analytics?.parameters.map((p) => (
                    <HBar key={p.label} {...p} />
                  ))
                )}
              </div>

              {/* 2b. Student Comments — MOVED from right sidebar to here */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={17} className="text-blue-600" />
                    <h2
                      className="font-bold text-gray-800"
                      style={{ fontSize: "clamp(0.9rem, 1.8vw, 1.05rem)" }}
                    >
                      Student Feedback
                    </h2>
                  </div>
                  <span
                    className="text-gray-400 font-medium"
                    style={{ fontSize: "clamp(0.65rem, 1.2vw, 0.72rem)" }}
                  >
                    Latest
                  </span>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-16 bg-gray-50 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 flex-1">
                    {(analytics?.comments ?? []).slice(0, 5).map((c, i) => (
                      <div key={c._id} className={i > 0 ? "pt-3 mt-3" : ""}>
                        <CommentCard {...c} />
                      </div>
                    ))}
                  </div>
                )}

                {(analytics?.comments?.length ?? 0) > 5 && (
                  <button
                    className="mt-4 text-center text-blue-600 font-semibold hover:underline"
                    style={{ fontSize: "clamp(0.72rem, 1.3vw, 0.8rem)" }}
                  >
                    View All Comments →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ══ RIGHT SIDEBAR ════════════════════════════════════════════ */}
          <div className="w-full lg:w-60 xl:w-64 shrink-0 space-y-4">
            {/* 1. Overall Score — REDUCED size */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star size={15} className="text-yellow-500 fill-yellow-500" />
                <h3
                  className="font-bold text-gray-800"
                  style={{ fontSize: "clamp(0.82rem, 1.5vw, 0.9rem)" }}
                >
                  Overall Score
                </h3>
              </div>

              {loading ? (
                <div className="h-16 bg-gray-50 rounded-xl animate-pulse" />
              ) : (
                <div className="flex items-center gap-4">
                  {/* Big number — smaller than before */}
                  <div className="shrink-0">
                    <span
                      className="font-extrabold text-blue-600 leading-none"
                      style={{ fontSize: "clamp(2rem, 4vw, 2.5rem)" }}
                    >
                      {analytics?.overallScore ?? "—"}
                    </span>
                    <pre
                      className="text-gray-400 block"
                      style={{ fontSize: "clamp(0.62rem, 1.1vw, 0.7rem)" }}
                    >
                      / 10
                    </pre>
                  </div>

                  {/* Progress bar + subject label */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="w-full bg-gray-100 rounded-full overflow-hidden mb-1"
                      style={{ height: 6 }}
                    >
                      <div
                        className="h-full rounded-full bg-linear-to-r from-blue-400 to-blue-600 transition-all duration-700"
                        style={{ width: `${scorePercent}%` }}
                      />
                    </div>
                    <div
                      className="flex justify-between text-gray-300"
                      style={{ fontSize: "clamp(0.55rem, 1vw, 0.62rem)" }}
                    >
                      <span>0</span>
                      <span>10</span>
                    </div>
                    <p
                      className="text-gray-500 mt-1 truncate"
                      style={{ fontSize: "clamp(0.62rem, 1.1vw, 0.7rem)" }}
                    >
                      {activeSubjectLabel}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Sentiment Analysis — MOVED from left column to here */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={16} className="text-blue-600" />
                <h3
                  className="font-bold text-gray-800"
                  style={{ fontSize: "clamp(0.82rem, 1.5vw, 0.9rem)" }}
                >
                  Sentiment Analysis
                </h3>
              </div>

              {loading ? (
                <div className="h-36 bg-gray-50 rounded-xl animate-pulse" />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <PieChart data={analytics?.sentiment} />

                  {/* Legend */}
                  <div className="w-full space-y-1.5">
                    {[
                      {
                        label: "Positive",
                        color: "bg-green-400",
                        val: analytics?.sentiment?.positive,
                      },
                      {
                        label: "Neutral",
                        color: "bg-yellow-400",
                        val: analytics?.sentiment?.neutral,
                      },
                      {
                        label: "Negative",
                        color: "bg-red-400",
                        val: analytics?.sentiment?.negative,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.color}`}
                          />
                          <span
                            className="text-gray-600"
                            style={{
                              fontSize: "clamp(0.68rem, 1.3vw, 0.78rem)",
                            }}
                          >
                            {item.label}
                          </span>
                        </div>
                        <span
                          className="font-semibold text-gray-700"
                          style={{ fontSize: "clamp(0.68rem, 1.3vw, 0.78rem)" }}
                        >
                          {item.val ?? 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FacultyAnalytics;
