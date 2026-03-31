<<<<<<< HEAD
import { useEffect, useState } from "react";
=======
import { useState } from "react";
>>>>>>> frontend
import {
  Users,
  BarChart2,
  Star,
  GraduationCap,
  Zap,
  Heart,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import CountCard from "../components/CountCard";
import FacultyForm, {
  EMPTY_FACULTY_FORM,
  validateFacultyForm,
  inputCls,
  Field,
} from "../components/FacultyForm";
<<<<<<< HEAD
const INITIAL_COUNTS = {
=======

// ─────────────────────────────────────────────────────────────────────────────
// MOCK COUNTS
// ─────────────────────────────────────────────────────────────────────────────
// API INTEGRATION — replace the const below with:
//
//   const [counts, setCounts] = useState(MOCK_COUNTS);
//   useEffect(() => {
//     const token = JSON.parse(sessionStorage.getItem("vit_user") ?? "{}")?.token;
//     fetch("/api/admin/stats", {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((r) => r.json())
//       .then(setCounts)
//       .catch(() => {}); // handle silently; cards will stay as skeleton
//   }, []);
//
// Expected API response shape:
//   { total: 42, INFT: 28, CMPN: 35, EXTC: 22, EXCS: 19, BIOMED: 15, FE: 31 }
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_COUNTS = {
>>>>>>> frontend
  total: null,
  INFT: null,
  CMPN: null,
  EXTC: null,
  EXCS: null,
  BIOMED: null,
  FE: null,
};
<<<<<<< HEAD
=======

// ─────────────────────────────────────────────────────────────────────────────
// PASSWORD HELPERS  (Step 2 — stays in this file, not shared)
// ─────────────────────────────────────────────────────────────────────────────
>>>>>>> frontend
const pwdStrength = (pwd) => {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
};
const STRENGTH_BARS = [
  "bg-red-400",
  "bg-yellow-400",
  "bg-blue-400",
  "bg-green-500",
];
const STRENGTH_TEXT = [
  "text-red-500",
  "text-yellow-500",
  "text-blue-500",
  "text-green-600",
];
const STRENGTH_LABEL = ["Weak", "Fair", "Good", "Strong"];

const validatePasswordStep = (f) => {
  const e = {};
  if (!f.password) e.password = "Password is required";
  else if (f.password.length < 8) e.password = "Minimum 8 characters";
  if (!f.confirmPassword) e.confirmPassword = "Please confirm your password";
  else if (f.password !== f.confirmPassword)
    e.confirmPassword = "Passwords do not match";
  return e;
};
<<<<<<< HEAD
const fs = { fontSize: "clamp(0.72rem, 1.4vw, 0.875rem)" };

const StepIndicator = ({ step }) => (
=======

// ─────────────────────────────────────────────────────────────────────────────
// STEP INDICATOR  (2 steps: Details → Password)
// ─────────────────────────────────────────────────────────────────────────────

// added responsive
const fs = { fontSize: "clamp(0.72rem, 1.4vw, 0.875rem)" };

const StepIndicator = ({ step }) => (
  // added responsive
>>>>>>> frontend
  <div className="flex items-center w-full mb-6 sm:mb-8">
    {["Details", "Password"].map((label, i) => {
      const s = i + 1;
      const done = s < step;
      const current = s === step;
      return (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
<<<<<<< HEAD
=======
            {/* added responsive copy whole div */}
>>>>>>> frontend
            <div
              className={`rounded-full flex items-center justify-center font-bold border-2 transition-all ${
                done
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : current
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "bg-white border-gray-300 text-gray-400"
              }`}
              style={{
                width: "clamp(1.8rem,3vw,2rem)",
                height: "clamp(1.8rem,3vw,2rem)",
                fontSize: "clamp(0.65rem,1.2vw,0.75rem)",
<<<<<<< HEAD
              }}>
=======
              }}
            >
>>>>>>> frontend
              {done ? <CheckCircle size={13} /> : s}
            </div>
            <span
              className={`text-xs mt-1.5 font-medium ${
                current
                  ? "text-blue-600"
                  : done
                    ? "text-blue-400"
                    : "text-gray-400"
<<<<<<< HEAD
              }`}>
=======
              }`}
            >
>>>>>>> frontend
              {label}
            </span>
          </div>
          {s < 2 && (
<<<<<<< HEAD
=======
            // added responsive
>>>>>>> frontend
            <div
              className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all ${
                step > 1 ? "bg-blue-600" : "bg-gray-200"
              }`}
              style={{ fontSize: "clamp(0.62rem,1.1vw,0.72rem)" }}
            />
          )}
        </div>
      );
    })}
  </div>
);
<<<<<<< HEAD
=======

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Password
// Receives detailsForm (Step 1 values) to render the summary card.
// Uses inputCls + Field imported from FacultyForm for visual consistency.
// ─────────────────────────────────────────────────────────────────────────────
>>>>>>> frontend
const PasswordStep = ({ detailsForm, pwdForm, setPwdForm, errors }) => {
  const [showPwd, setShowPwd] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const strength = pwdStrength(pwdForm.password);

  return (
<<<<<<< HEAD
    <div className="space-y-4 sm:space-y-5">
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 sm:px-5 py-4">
        <p
          className="font-semibold text-indigo-500 uppercase tracking-wide mb-3"
          style={{ fontSize: "clamp(0.62rem,1.1vw,0.72rem)" }}>
=======
    // added responsive
    <div className="space-y-4 sm:space-y-5">
      {/* Summary card — shows confirmed Step 1 values */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 sm:px-5 py-4">
        <p
          className="font-semibold text-indigo-500 uppercase tracking-wide mb-3"
          style={{ fontSize: "clamp(0.62rem,1.1vw,0.72rem)" }}
        >
>>>>>>> frontend
          Confirm details before setting password
        </p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          {[
            ["Name", detailsForm.fullName],
            ["Email", detailsForm.email],
            ["Department", detailsForm.department],
            ["Role", detailsForm.role],
            [
              "Designation",
              detailsForm.role === "HOD"
                ? "Head of Department"
                : detailsForm.designation,
            ],
          ]
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="flex flex-col">
<<<<<<< HEAD
                <span
                  className="text-gray-400"
                  style={{ fontSize: "clamp(0.62rem,1.1vw,0.72rem)" }}>
=======
                {/* added responsive */}
                <span
                  className="text-gray-400"
                  style={{ fontSize: "clamp(0.62rem,1.1vw,0.72rem)" }}
                >
>>>>>>> frontend
                  {k}
                </span>
                <span className="font-medium text-gray-700 truncate" style={fs}>
                  {v}
                </span>
              </div>
            ))}
        </div>
      </div>

<<<<<<< HEAD
=======
      {/* added responsive */}
>>>>>>> frontend
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Password" error={errors.password}>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none"
            />
            <input
              type={showPwd ? "text" : "password"}
              value={pwdForm.password}
              onChange={(e) =>
                setPwdForm((f) => ({ ...f, password: e.target.value }))
              }
              placeholder="Minimum 8 characters"
              className={`${inputCls(errors.password)} pl-10 pr-10`}
              style={fs}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
<<<<<<< HEAD
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition">
=======
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition"
            >
>>>>>>> frontend
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {pwdForm.password && (
            <div className="mt-1.5 space-y-1">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      i < strength ? STRENGTH_BARS[strength - 1] : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
<<<<<<< HEAD

              <p
                className={`text-xs font-medium ${STRENGTH_TEXT[strength - 1]}`}
                style={{ fontSize: "clamp(0.62rem,1.1vw,0.72rem)" }}>
=======
              {/* added reponsive */}
              <p
                className={`text-xs font-medium ${STRENGTH_TEXT[strength - 1]}`}
                style={{ fontSize: "clamp(0.62rem,1.1vw,0.72rem)" }}
              >
>>>>>>> frontend
                {STRENGTH_LABEL[strength - 1]}
              </p>
            </div>
          )}
        </Field>

        <Field label="Confirm Password" error={errors.confirmPassword}>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none"
            />
            <input
              type={showConf ? "text" : "password"}
              value={pwdForm.confirmPassword}
              onChange={(e) =>
                setPwdForm((f) => ({ ...f, confirmPassword: e.target.value }))
              }
              placeholder="Re-enter password"
              className={`${inputCls(errors.confirmPassword)} pl-10 pr-10`}
<<<<<<< HEAD
=======
              // added responsive
>>>>>>> frontend
              style={fs}
            />
            <button
              type="button"
              onClick={() => setShowConf((v) => !v)}
<<<<<<< HEAD
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition">
=======
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition"
            >
>>>>>>> frontend
              {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {pwdForm.confirmPassword &&
            pwdForm.password === pwdForm.confirmPassword &&
            !errors.confirmPassword && (
<<<<<<< HEAD
              <p
                className="flex items-center gap-1 text-xs text-green-600 mt-0.5"
                style={{ fontSize: "clamp(0.62rem,1.1vw,0.72rem)" }}>
=======
              // added responsive
              <p
                className="flex items-center gap-1 text-xs text-green-600 mt-0.5"
                style={{ fontSize: "clamp(0.62rem,1.1vw,0.72rem)" }}
              >
>>>>>>> frontend
                <CheckCircle size={11} /> Passwords match
              </p>
            )}
        </Field>
      </div>
    </div>
  );
};
<<<<<<< HEAD
=======

// ─────────────────────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────────────────────
>>>>>>> frontend
const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium bg-white border ${
        toast.type === "success"
          ? "border-green-200 text-green-700"
          : "border-red-200 text-red-600"
      }`}
<<<<<<< HEAD
      style={fs}>
=======
      // added responsive
      style={fs}
    >
>>>>>>> frontend
      {toast.type === "success" ? (
        <CheckCircle size={18} className="text-green-500" />
      ) : (
        <AlertCircle size={18} className="text-red-400" />
      )}
      {toast.message}
    </div>
  );
};
<<<<<<< HEAD
const AdminDashboard = () => {
  const [counts, setCounts] = useState(INITIAL_COUNTS);
  const [detailsForm, setDetailsForm] = useState(EMPTY_FACULTY_FORM);
  const [detailsErrors, setDetailsErrors] = useState({});
  const [pwdForm, setPwdForm] = useState({ password: "", confirmPassword: "" });
  const [pwdErrors, setPwdErrors] = useState({});
=======

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD — root
// ─────────────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  // ── Stats ─────────────────────────────────────────────────────────────────
  const [counts] = useState(MOCK_COUNTS); // swap for useState+useEffect (see comment above)

  // ── Step 1 — faculty details (driven by FacultyForm) ──────────────────────
  const [detailsForm, setDetailsForm] = useState(EMPTY_FACULTY_FORM);
  const [detailsErrors, setDetailsErrors] = useState({});

  // ── Step 2 — password (local to this page) ────────────────────────────────
  const [pwdForm, setPwdForm] = useState({ password: "", confirmPassword: "" });
  const [pwdErrors, setPwdErrors] = useState({});

  // ── Wizard state ──────────────────────────────────────────────────────────
>>>>>>> frontend
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

<<<<<<< HEAD
  const fetchStats = async (withToast = false) => {
    try {
      const token = JSON.parse(
        sessionStorage.getItem("vit_user") ?? "{}",
      )?.token;
      const res = await fetch("/api/admin/stats", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const payload = await res.json();

      if (!res.ok) {
        if (withToast) {
          showToast(payload?.message || "Failed to refresh stats.", "error");
        }
        return;
      }

      setCounts(payload?.data || INITIAL_COUNTS);
      if (withToast) {
        showToast("Stats refreshed successfully.");
      }
    } catch {
      if (withToast) {
        showToast("Network error while refreshing stats.", "error");
      }
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

=======
>>>>>>> frontend
  const handleNext = () => {
    const errs = validateFacultyForm(detailsForm, "add");
    if (Object.keys(errs).length) {
      setDetailsErrors(errs);
      return;
    }
    setDetailsErrors({});
    setStep(2);
  };

  const handleBack = () => {
    setDetailsErrors({});
    setPwdErrors({});
    setStep(1);
  };
<<<<<<< HEAD
=======

  // ── API INTEGRATION: POST /api/admin/faculty ───────────────────────────────
  // Payload keys match the backend User mongoose schema exactly.
  // Token is pulled from sessionStorage (written by AuthContext at login).
  // ─────────────────────────────────────────────────────────────────────────
>>>>>>> frontend
  const handleSubmit = async () => {
    const errs = validatePasswordStep(pwdForm);
    if (Object.keys(errs).length) {
      setPwdErrors(errs);
      return;
    }
    setPwdErrors({});
    setLoading(true);

    const payload = {
      fullName: detailsForm.fullName.trim(),
      email: detailsForm.email.trim().toLowerCase(),
      password: pwdForm.password,
      role: detailsForm.role,
      department: detailsForm.department,
<<<<<<< HEAD
=======
      // Backend schema uses "Head of Department" string for HOD designation
>>>>>>> frontend
      designation:
        detailsForm.role === "HOD"
          ? "Head of Department"
          : detailsForm.designation,
<<<<<<< HEAD
      subjects: [],
=======
      subjects: [], // subjects managed via a separate flow
>>>>>>> frontend
    };

    try {
      const token = JSON.parse(
        sessionStorage.getItem("vit_user") ?? "{}",
      )?.token;
      const res = await fetch("/api/admin/faculty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
<<<<<<< HEAD
=======
        // Surface backend error e.g. 409 duplicate email
>>>>>>> frontend
        showToast(data?.message || "Failed to add faculty.", "error");
        return;
      }

      showToast(`${detailsForm.fullName} added successfully!`);
<<<<<<< HEAD
      fetchStats();
=======
      // Reset both steps
>>>>>>> frontend
      setDetailsForm(EMPTY_FACULTY_FORM);
      setPwdForm({ password: "", confirmPassword: "" });
      setStep(1);
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };
<<<<<<< HEAD
=======

  // ── Count cards config ─────────────────────────────────────────────────────
>>>>>>> frontend
  const countCards = [
    {
      label: "Total Faculty in VIT",
      count: counts.total,
      iconBg: "bg-blue-50 text-blue-500",
    },
    {
      label: "INFT Dept.",
      count: counts.INFT,
      iconBg: "bg-emerald-50 text-emerald-500",
    },
    {
      label: "CMPN Dept.",
      count: counts.CMPN,
      iconBg: "bg-yellow-50 text-yellow-500",
    },
    {
      label: "EXTC Dept.",
      count: counts.EXTC,
      iconBg: "bg-purple-50 text-purple-500",
    },
    {
      label: "EXCS Dept.",
      count: counts.EXCS,
      iconBg: "bg-sky-50 text-sky-500",
    },
    {
      label: "BIOMED Dept.",
      count: counts.BIOMED,
      iconBg: "bg-rose-50 text-rose-500",
    },
    { label: "FE Dept.", count: counts.FE, iconBg: "bg-teal-50 text-teal-500" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
<<<<<<< HEAD

      <div className="flex-1 flex flex-col min-w-0 lg:ml-[clamp(200px,15vw,240px)]">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pt-16 lg:pt-8">
          <section>
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div>
                <h2
                  className="font-bold text-gray-800"
                  style={{ fontSize: "clamp(0.95rem, 2vw, 1.125rem)" }}>
                  Institute Overview
                </h2>

                <p
                  className="text-gray-400 mt-0.5"
                  style={{ fontSize: "clamp(0.7rem, 1.4vw, 0.8rem)" }}>
                  Live statistics across the institute
                </p>
              </div>

              <button
                type="button"
                onClick={() => fetchStats(true)}
                className="text-gray-400 mt-0.5 cursor-pointer"
                style={{ fontSize: "clamp(0.7rem, 1.4vw, 0.8rem)" }}>
                <RefreshCw size={13} /> Refresh
              </button>
            </div>

            <div
              className="flex gap-3 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap lg:flex-nowrap"
              style={{ scrollbarWidth: "none" }}>
=======
      {/* added responsive */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[clamp(200px,15vw,240px)]">
        {/* added responsive */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pt-16 lg:pt-8">
          {/* ── Institute Overview ─────────────────────────────────────────── */}
          <section>
            {/* added responsive */}
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div>
                {/* added responsive */}
                <h2
                  className="font-bold text-gray-800"
                  style={{ fontSize: "clamp(0.95rem, 2vw, 1.125rem)" }}
                >
                  Institute Overview
                </h2>
                {/* added responsive */}
                <p
                  className="text-gray-400 mt-0.5"
                  style={{ fontSize: "clamp(0.7rem, 1.4vw, 0.8rem)" }}
                >
                  Live statistics across the institute
                </p>
              </div>
              {/* added responsive */}
              <button
                className="text-gray-400 mt-0.5"
                style={{ fontSize: "clamp(0.7rem, 1.4vw, 0.8rem)" }}
              >
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
            {/* added responsive */}
            <div
              className="flex gap-3 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap lg:flex-nowrap"
              style={{ scrollbarWidth: "none" }}
            >
>>>>>>> frontend
              {countCards.map((c) => (
                <CountCard key={c.label} {...c} />
              ))}
            </div>
          </section>

<<<<<<< HEAD
          <section>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 sm:px-8 lg:px-10 py-6 sm:py-8">
              <StepIndicator step={step} />

              <div className="mb-5 sm:mb-7">
                <h2
                  className="font-bold text-gray-800"
                  style={{ fontSize: "clamp(1rem, 2.2vw, 1.25rem)" }}>
                  Add Faculty
                </h2>

                <p
                  className="text-gray-400 mt-0.5"
                  style={{ fontSize: "clamp(0.7rem, 1.4vw, 0.8rem)" }}>
=======
          {/* ── Add Faculty — 2-step wizard ────────────────────────────────── */}
          <section>
            {/* added responsive */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 sm:px-8 lg:px-10 py-6 sm:py-8">
              <StepIndicator step={step} />
              {/* added reponsive */}
              <div className="mb-5 sm:mb-7">
                {/* added reponsive */}
                <h2
                  className="font-bold text-gray-800"
                  style={{ fontSize: "clamp(1rem, 2.2vw, 1.25rem)" }}
                >
                  Add Faculty
                </h2>
                {/* added reponsive */}
                <p
                  className="text-gray-400 mt-0.5"
                  style={{ fontSize: "clamp(0.7rem, 1.4vw, 0.8rem)" }}
                >
>>>>>>> frontend
                  Register a new faculty member to the system
                </p>
              </div>

<<<<<<< HEAD
=======
              {/* Step 1 — FacultyForm (from components/FacultyForm.jsx) */}
>>>>>>> frontend
              {step === 1 && (
                <FacultyForm
                  form={detailsForm}
                  setForm={setDetailsForm}
                  errors={detailsErrors}
                  mode="add"
                />
              )}

<<<<<<< HEAD
=======
              {/* Step 2 — Password (local to this page) */}
>>>>>>> frontend
              {step === 2 && (
                <PasswordStep
                  detailsForm={detailsForm}
                  pwdForm={pwdForm}
                  setPwdForm={setPwdForm}
                  errors={pwdErrors}
                />
              )}

<<<<<<< HEAD
              <div className="flex gap-3 mt-6 sm:mt-8">
                {step === 2 && (
=======
              {/* added responsive */}
              <div className="flex gap-3 mt-6 sm:mt-8">
                {step === 2 && (
                  // added responsive
>>>>>>> frontend
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
<<<<<<< HEAD
                    style={fs}>
=======
                    style={fs}
                  >
>>>>>>> frontend
                    Back
                  </button>
                )}

                {step === 1 ? (
<<<<<<< HEAD
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200"
                    style={fs}>
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
=======
                  // added responsive
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200 cursor-pointer"
                    style={fs}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  // added responsive
>>>>>>> frontend
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200 disabled:opacity-60"
<<<<<<< HEAD
                    style={fs}>
=======
                    style={fs}
                  >
>>>>>>> frontend
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />{" "}
                        Submitting…
                      </>
                    ) : (
                      "Add Faculty Member"
                    )}
                  </button>
                )}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>

      <Toast toast={toast} />
    </div>
  );
};

export default AdminDashboard;
