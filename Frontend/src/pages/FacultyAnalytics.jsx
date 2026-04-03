import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Star,
  MessageSquare,
  TrendingUp,
  BarChart2,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import Footer from "../components/Footer";
import TimelineChart from "../components/TimelineChart";
import HBar from "../components/HBar";
import PieChart from "../components/PieChart";
import CommentCard from "../components/CommentCard";
import Header from "../components/Header";

const PARAM_CONFIG = [
  { key: "conceptClarity", label: "Concept Clarity" },
  { key: "lectureStructure", label: "Lecture Structure" },
  { key: "subjectMastery", label: "Subject Mastery" },
  { key: "practicalUnderstanding", label: "Practical Understanding" },
  { key: "studentEngagement", label: "Student Engagement" },
  { key: "lecturePace", label: "Lecture Pace" },
  { key: "learningOutcomeImpact", label: "Learning Outcome Impact" },
];

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter((w) => w && !["Dr.", "Prof.", "Mr.", "Mrs.", "Ms."].includes(w))
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const FacultyAnalytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const isHodView = user?.role === "HOD" && Boolean(id);

  const [subjects, setSubjects] = useState([
    { _id: "overall", name: "Overall", code: "" },
  ]);
  const [activeSubj, setActiveSubj] = useState("overall");
  const [filter, setFilter] = useState("weekly");
  const [analytics, setAnalytics] = useState({
    overallScore: 0,
    trend: [],
    parameters: [],
    sentiment: { positive: 0, neutral: 0, negative: 0 },
    comments: [],
  });
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch(
          isHodView ? `/api/subjects/faculty/${id}` : "/api/subjects/mine",
          {
            headers: {
              ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
            },
            credentials: "include",
          },
        );
        const payload = await res.json();

        if (!res.ok) return;

        const list = Array.isArray(payload?.data) ? payload.data : [];
        setSubjects([{ _id: "overall", name: "Overall", code: "" }, ...list]);
      } catch {
        // ignore
      }
    };

    if (user?.token) fetchSubjects();
  }, [id, isHodView, user?.token]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);

      try {
        const subjectQuery =
          activeSubj !== "overall"
            ? `?subjectId=${encodeURIComponent(activeSubj)}`
            : "";

        const headers = {
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        };

        const analyticsUrl = isHodView
          ? `/api/analytics/faculty/${id}/analytics${subjectQuery}`
          : `/api/analytics/faculty${subjectQuery}`;

        const timelineUrl = isHodView
          ? `/api/analytics/faculty/${id}/timeline${subjectQuery}`
          : `/api/analytics/faculty/timeline${subjectQuery}`;

        const [analyticsRes, timelineRes] = await Promise.all([
          fetch(analyticsUrl, {
            headers,
            credentials: "include",
          }),
          fetch(timelineUrl, {
            headers,
            credentials: "include",
          }),
        ]);

        const analyticsPayload = await analyticsRes.json();
        const timelinePayload = await timelineRes.json();

        if (!analyticsRes.ok || !timelineRes.ok) {
          setAnalytics({
            overallScore: 0,
            trend: [],
            parameters: [],
            sentiment: { positive: 0, neutral: 0, negative: 0 },
            comments: [],
          });
          return;
        }

        const stats = analyticsPayload?.data?.stats || {};
        const total = stats.total || 0;

        const sentiment = {
          positive: total
            ? Math.round(((stats.positive || 0) / total) * 100)
            : 0,
          neutral: total ? Math.round(((stats.neutral || 0) / total) * 100) : 0,
          negative: total
            ? Math.round(((stats.negative || 0) / total) * 100)
            : 0,
        };

        const trendRaw = Array.isArray(timelinePayload?.data)
          ? timelinePayload.data
          : [];

        const trend = trendRaw.map((point) => {
          const label =
            filter === "weekly" ? point.label : point.label?.slice(0, 7);

          return {
            label,
            score: point.score,
            deptAvg: point.deptAvg,
          };
        });

        const parameters = PARAM_CONFIG.map((param) => ({
          label: param.label,
          score: Number(stats?.[param.key] || 0).toFixed(2),
          max: 5,
        }));

        const commentsRaw = Array.isArray(analyticsPayload?.data?.comments)
          ? analyticsPayload.data.comments
          : [];

        const comments = commentsRaw.map((item) => ({
          _id: item._id,
          initials: "ST",
          text: item.remark,
          sentiment:
            item.sentiment === "Neutral" ? "Constructive" : item.sentiment,
          date: new Date(item.createdAt).toLocaleDateString("en-US"),
        }));

        setAnalytics({
          overallScore: Number(((stats.avgRating || 0) * 2).toFixed(1)),
          trend,
          parameters,
          sentiment,
          comments,
        });
      } catch {
        setAnalytics({
          overallScore: 0,
          trend: [],
          parameters: [],
          sentiment: { positive: 0, neutral: 0, negative: 0 },
          comments: [],
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchAnalytics();
    }
  }, [activeSubj, filter, id, isHodView, user?.token]);

  const activeSubjectLabel =
    subjects.find((s) => s._id === activeSubj)?.name ?? "Overall";

  const scorePercent = ((analytics?.overallScore ?? 0) / 10) * 100;

  const initials = getInitials(user?.name);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header initials={initials} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-gray-400 hover:text-blue-600 transition mb-2 cursor-pointer"
            style={{ fontSize: "clamp(0.72rem, 1.4vw, 0.8rem)" }}>
            <ChevronLeft size={14} /> Back
          </button>
          <h1
            className="font-bold text-gray-700"
            style={{ fontSize: "clamp(1.3rem, 3vw, 1.75rem)" }}>
            Performance Analytics
          </h1>
          <p
            className="text-gray-400 mt-0.5"
            style={{ fontSize: "clamp(0.72rem, 1.4vw, 0.8rem)" }}>
            {user?.department} · {new Date().getFullYear()}
          </p>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-2 mb-6"
          style={{ scrollbarWidth: "none" }}>
          {subjects.map((s) => (
            <button
              key={s._id}
              onClick={() => setActiveSubj(s._id)}
              className={`shrink-0 px-4 py-2 rounded-full font-medium transition border cursor-pointer ${
                activeSubj === s._id
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
              }`}
              style={{ fontSize: "clamp(0.75rem, 1.4vw, 0.875rem)" }}>
              {s.name}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-1 min-w-0 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={17} className="text-blue-600" />
                  <h2
                    className="font-bold text-gray-800"
                    style={{ fontSize: "clamp(0.9rem, 1.8vw, 1.05rem)" }}>
                    Weekly Performance Trend
                  </h2>
                </div>

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
                      style={{ fontSize: "clamp(0.65rem, 1.2vw, 0.75rem)" }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-5 mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-0.5 bg-blue-600 rounded-full" />
                  <span
                    className="text-gray-500"
                    style={{ fontSize: "clamp(0.65rem, 1.2vw, 0.75rem)" }}>
                    You
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 border-t-2 border-dashed border-gray-300" />
                  <span
                    className="text-gray-500"
                    style={{ fontSize: "clamp(0.65rem, 1.2vw, 0.75rem)" }}>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 size={17} className="text-blue-600" />
                  <h2
                    className="font-bold text-gray-800"
                    style={{ fontSize: "clamp(0.9rem, 1.8vw, 1.05rem)" }}>
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

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={17} className="text-blue-600" />
                    <h2
                      className="font-bold text-gray-800"
                      style={{ fontSize: "clamp(0.9rem, 1.8vw, 1.05rem)" }}>
                      Student Feedback
                    </h2>
                  </div>
                  <span
                    className="text-gray-400 font-medium"
                    style={{ fontSize: "clamp(0.65rem, 1.2vw, 0.72rem)" }}>
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
              </div>
            </div>
          </div>

          <div className="w-full lg:w-60 xl:w-64 shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star size={15} className="text-yellow-500 fill-yellow-500" />
                <h3
                  className="font-bold text-gray-800"
                  style={{ fontSize: "clamp(0.82rem, 1.5vw, 0.9rem)" }}>
                  Overall Score
                </h3>
              </div>

              {loading ? (
                <div className="h-16 bg-gray-50 rounded-xl animate-pulse" />
              ) : (
                <div className="flex items-center gap-4">
                  <div className="shrink-0">
                    <span
                      className="font-extrabold text-blue-600 leading-none"
                      style={{ fontSize: "clamp(2rem, 4vw, 2.5rem)" }}>
                      {analytics?.overallScore ?? "—"}
                    </span>
                    <pre
                      className="text-gray-400 block"
                      style={{ fontSize: "clamp(0.62rem, 1.1vw, 0.7rem)" }}>
                      / 10
                    </pre>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div
                      className="w-full bg-gray-100 rounded-full overflow-hidden mb-1"
                      style={{ height: 6 }}>
                      <div
                        className="h-full rounded-full bg-linear-to-r from-blue-400 to-blue-600 transition-all duration-700"
                        style={{ width: `${scorePercent}%` }}
                      />
                    </div>
                    <div
                      className="flex justify-between text-gray-300"
                      style={{ fontSize: "clamp(0.55rem, 1vw, 0.62rem)" }}>
                      <span>0</span>
                      <span>10</span>
                    </div>
                    <p
                      className="text-gray-500 mt-1 truncate"
                      style={{ fontSize: "clamp(0.62rem, 1.1vw, 0.7rem)" }}>
                      {activeSubjectLabel}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={16} className="text-blue-600" />
                <h3
                  className="font-bold text-gray-800"
                  style={{ fontSize: "clamp(0.82rem, 1.5vw, 0.9rem)" }}>
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
                        className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.color}`}
                          />
                          <span
                            className="text-gray-600"
                            style={{
                              fontSize: "clamp(0.68rem, 1.3vw, 0.78rem)",
                            }}>
                            {item.label}
                          </span>
                        </div>
                        <span
                          className="font-semibold text-gray-700"
                          style={{
                            fontSize: "clamp(0.68rem, 1.3vw, 0.78rem)",
                          }}>
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
