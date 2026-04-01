import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Lightbulb,
  LayoutList,
  ShieldCheck,
  Wrench,
  MessageSquareText,
  Timer,
  Target,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Hash,
} from "lucide-react";
import logo from "../assets/vit.png";
import Footer from "../components/Footer";

const QUESTIONS = [
  {
    key: "conceptClarity",
    label: "Concept Clarity",
    desc: "The instructor explained the core concepts clearly and effectively.",
    icon: Lightbulb,
  },
  {
    key: "lectureStructure",
    label: "Lecture Structure",
    desc: "The lecture was logically organized and easy to follow throughout.",
    icon: LayoutList,
  },
  {
    key: "subjectMastery",
    label: "Subject Mastery",
    desc: "The instructor demonstrated deep expertise and strong understanding.",
    icon: ShieldCheck,
  },
  {
    key: "practicalUnderstanding",
    label: "Practical Application",
    desc: "Examples and practical problems significantly improved understanding.",
    icon: Wrench,
  },
  {
    key: "studentEngagement",
    label: "Student Engagement",
    desc: "The instructor actively encouraged questions and student interaction.",
    icon: MessageSquareText,
  },
  {
    key: "lecturePace",
    label: "Lecture Pace",
    desc: "The pace was appropriate, allowing proper understanding of the material.",
    icon: Timer,
  },
  {
    key: "learningOutcomeImpact",
    label: "Learning Outcome Impact",
    desc: "Overall, the lectures significantly improved my ability to understand or apply the specific topic.",
    icon: Target,
  },
];

const EMPTY_RATINGS = Object.fromEntries(QUESTIONS.map((q) => [q.key, null]));

const EMPTY_FORM = {
  studentName: "",
  rollNo: "",
  remarks: "",
  ratings: EMPTY_RATINGS,
};

const validate = (form, token) => {
  const errors = {};

  if (!form.studentName.trim()) errors.studentName = "Name is required.";
  else if (form.studentName.trim().length < 2)
    errors.studentName = "Name must be at least 2 characters.";

  if (!form.rollNo.trim()) errors.rollNo = "Roll No. is required.";
  else if (!/^[a-zA-Z0-9]+$/.test(form.rollNo.trim()))
    errors.rollNo =
      "Roll No. must be alphanumeric (no spaces or special characters).";

  if (!token) errors.session = "Session token missing. Please rescan the QR.";

  QUESTIONS.forEach((q) => {
    if (form.ratings[q.key] === null)
      errors[q.key] = `Please rate "${q.label}".`;
  });

  return errors;
};

const RatingButtons = ({ questionKey, value, onChange, error }) => (
  <div>
    <div className="flex gap-2 sm:gap-3 mt-3">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(questionKey, n)}
          className={`flex-1 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-150 cursor-pointer border-2 ${
            value === n
              ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200"
              : "bg-white border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600"
          }`}
          style={{ fontSize: "clamp(0.85rem, 3vw, 1rem)" }}>
          {n}
        </button>
      ))}
    </div>
    {error && (
      <p
        className="flex items-center gap-1 mt-2 text-red-500"
        style={{ fontSize: "clamp(0.7rem, 2.5vw, 0.78rem)" }}>
        <AlertCircle size={12} className="shrink-0" /> {error}
      </p>
    )}
  </div>
);

const QuestionCard = ({ question, value, onChange, error }) => {
  const Icon = question.icon;
  return (
    <div
      className={`bg-white rounded-2xl p-5 sm:p-6 shadow-sm border transition-all duration-200 ${
        error ? "border-red-200" : "border-gray-100"
      }`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3
          className="font-bold text-gray-900"
          style={{ fontSize: "clamp(0.95rem, 3.5vw, 1.1rem)" }}>
          {question.label}
        </h3>
        <Icon size={20} className="text-indigo-500 shrink-0 mt-0.5" />
      </div>
      <p
        className="text-gray-500 leading-relaxed"
        style={{ fontSize: "clamp(0.78rem, 2.8vw, 0.875rem)" }}>
        {question.desc}
      </p>
      <RatingButtons
        questionKey={question.key}
        value={value}
        onChange={onChange}
        error={error}
      />
    </div>
  );
};

const SuccessScreen = ({ facultyName, subject }) => (
  <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center px-4">
    <div className="text-center max-w-sm w-full">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
        <CheckCircle size={40} className="text-green-500" />
      </div>
      <h2
        className="font-extrabold text-gray-900 mb-2"
        style={{ fontSize: "clamp(1.3rem, 5vw, 1.75rem)" }}>
        Feedback Submitted!
      </h2>
      <p
        className="text-gray-500 leading-relaxed mb-1"
        style={{ fontSize: "clamp(0.85rem, 3vw, 0.95rem)" }}>
        Thank you for your honest feedback.
      </p>
      {facultyName && (
        <p
          className="text-gray-400"
          style={{ fontSize: "clamp(0.78rem, 2.8vw, 0.875rem)" }}>
          Submitted for{" "}
          <span className="font-semibold text-gray-600">{facultyName}</span>
          {subject ? ` · ${subject}` : ""}
        </p>
      )}
      <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
        <p
          className="text-indigo-600 font-medium"
          style={{ fontSize: "clamp(0.78rem, 2.8vw, 0.875rem)" }}>
          Your response has been recorded anonymously and will help improve
          academic quality.
        </p>
      </div>
    </div>
  </div>
);

const FeedbackForm = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState("");
  const [sessionMeta, setSessionMeta] = useState({
    facultyName: "",
    subject: "",
  });
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      if (!token) {
        setApiError("Invalid QR link. Please rescan the QR code.");
        setSessionLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/sessions/${encodeURIComponent(token)}`);
        const payload = await res.json();

        if (!res.ok) {
          setApiError(payload?.message || "Session is invalid or expired.");
          return;
        }

        setSessionMeta({
          facultyName: payload?.data?.faculty?.fullName || "",
          subject: payload?.data?.subject?.name || "",
        });
      } catch {
        setApiError("Unable to validate QR session. Please try again.");
      } finally {
        setSessionLoading(false);
      }
    };

    validateSession();
  }, [token]);

  const handleInput = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
    setApiError("");
  };

  const handleRating = (key, value) => {
    setForm((f) => ({ ...f, ratings: { ...f.ratings, [key]: value } }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const errs = validate(form, token);
    if (Object.keys(errs).length) {
      setErrors(errs);

      const firstErrEl = document.querySelector("[data-error='true']");
      firstErrEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setLoading(true);

    const payload = {
      token,
      studentName: form.studentName.trim(),
      rollNo: form.rollNo.trim().toUpperCase(),
      rating: form.ratings,
      remark: form.remarks.trim(),
    };

    try {
      const res = await fetch("/api/feedback/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setApiError(data?.message || "Submission failed. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted)
    return (
      <SuccessScreen
        facultyName={sessionMeta.facultyName}
        subject={sessionMeta.subject}
      />
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
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
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h1
            className="font-bold text-gray-600 leading-tight"
            style={{ fontSize: "clamp(1rem, 6vw, 1.5rem)" }}>
            Academic Assessment
          </h1>
          <p
            className="text-gray-500 mt-2 leading-relaxed"
            style={{ fontSize: "clamp(0.82rem, 3vw, 0.95rem)" }}>
            Please provide honest feedback regarding your instructor's
            performance. Your insights help us maintain high educational
            standards.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div data-error={!!errors.studentName}>
                <label
                  className="block font-semibold uppercase tracking-wider text-gray-400 mb-2"
                  style={{ fontSize: "clamp(0.6rem, 2.2vw, 0.68rem)" }}>
                  Name
                </label>
                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={form.studentName}
                    onChange={(e) => handleInput("studentName", e.target.value)}
                    placeholder="e.g. Omprakash Maurya"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition ${
                      errors.studentName
                        ? "border-red-300 focus:ring-red-400"
                        : "border-gray-200 focus:ring-indigo-400"
                    }`}
                    style={{ fontSize: "clamp(0.85rem, 3vw, 0.95rem)" }}
                  />
                </div>
                {errors.studentName && (
                  <p
                    className="flex items-center gap-1 mt-1.5 text-red-500"
                    style={{ fontSize: "clamp(0.7rem, 2.5vw, 0.78rem)" }}>
                    <AlertCircle size={12} /> {errors.studentName}
                  </p>
                )}
              </div>

              <div data-error={!!errors.rollNo}>
                <label
                  className="block font-semibold uppercase tracking-wider text-gray-400 mb-2"
                  style={{ fontSize: "clamp(0.6rem, 2.2vw, 0.68rem)" }}>
                  Roll No.
                </label>
                <div className="relative">
                  <Hash
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={form.rollNo}
                    onChange={(e) => handleInput("rollNo", e.target.value)}
                    placeholder="e.g. CS2024001"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition ${
                      errors.rollNo
                        ? "border-red-300 focus:ring-red-400"
                        : "border-gray-200 focus:ring-indigo-400"
                    }`}
                    style={{ fontSize: "clamp(0.85rem, 3vw, 0.95rem)" }}
                  />
                </div>
                {errors.rollNo && (
                  <p
                    className="flex items-center gap-1 mt-1.5 text-red-500"
                    style={{ fontSize: "clamp(0.7rem, 2.5vw, 0.78rem)" }}>
                    <AlertCircle size={12} /> {errors.rollNo}
                  </p>
                )}
              </div>
            </div>

            {(sessionMeta.facultyName || sessionMeta.subject) && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
                {sessionMeta.facultyName && (
                  <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1">
                    <span
                      className="text-indigo-700 font-medium"
                      style={{ fontSize: "clamp(0.7rem, 2.5vw, 0.78rem)" }}>
                      {sessionMeta.facultyName}
                    </span>
                  </div>
                )}
                {sessionMeta.subject && (
                  <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1">
                    <span
                      className="text-indigo-700 font-medium"
                      style={{ fontSize: "clamp(0.7rem, 2.5vw, 0.78rem)" }}>
                      {sessionMeta.subject}
                    </span>
                  </div>
                )}
              </div>
            )}

            {(errors.session || apiError) && (
              <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle
                  size={15}
                  className="text-red-500 shrink-0 mt-0.5"
                />
                <p
                  className="text-red-600"
                  style={{ fontSize: "clamp(0.72rem, 2.6vw, 0.8rem)" }}>
                  {errors.session || apiError}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {QUESTIONS.map((q) => (
              <div key={q.key} data-error={!!errors[q.key]}>
                <QuestionCard
                  question={q}
                  value={form.ratings[q.key]}
                  onChange={handleRating}
                  error={errors[q.key]}
                />
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <label
              className="block font-semibold uppercase tracking-wider text-gray-400 mb-3"
              style={{ fontSize: "clamp(0.6rem, 2.2vw, 0.68rem)" }}>
              Remarks If Any
            </label>
            <textarea
              value={form.remarks}
              onChange={(e) => handleInput("remarks", e.target.value)}
              rows={4}
              placeholder="Share any additional comments or specific areas for improvement..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition resize-none"
              style={{ fontSize: "clamp(0.85rem, 3vw, 0.95rem)" }}
            />
          </div>

          {apiError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3.5">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p
                className="text-red-600 font-medium"
                style={{ fontSize: "clamp(0.78rem, 2.8vw, 0.875rem)" }}>
                {apiError}
              </p>
            </div>
          )}

          <div className="pb-6">
            <button
              type="submit"
              disabled={loading || sessionLoading || !token || !!apiError}
              className="w-full flex items-center justify-center gap-2.5 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              style={{ fontSize: "clamp(0.95rem, 3.5vw, 1.05rem)" }}>
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Submitting…
                </>
              ) : (
                "Submit Evaluation"
              )}
            </button>

            <p
              className="text-center text-gray-400 mt-3"
              style={{ fontSize: "clamp(0.68rem, 2.4vw, 0.78rem)" }}>
              All fields marked as rating are mandatory for final submission.
            </p>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default FeedbackForm;
