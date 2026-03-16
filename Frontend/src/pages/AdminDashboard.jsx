import { useState } from "react";
import {
  Users, BarChart2, Star, GraduationCap, Zap, Heart, RefreshCw,
  Lock, Eye, EyeOff, ChevronRight, CheckCircle, AlertCircle, Loader2,
} from "lucide-react";
import Sidebar   from "../components/Sidebar";
import Footer    from "../components/Footer";
import CountCard from "../components/CountCard";
import FacultyForm, {
  EMPTY_FACULTY_FORM,
  validateFacultyForm,
  inputCls,
  Field,
} from "../components/FacultyForm";

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
  total: null, INFT: null, CMPN: null,
  EXTC:  null, EXCS: null, BIOMED: null, FE: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// PASSWORD HELPERS  (Step 2 — stays in this file, not shared)
// ─────────────────────────────────────────────────────────────────────────────
const pwdStrength = (pwd) => {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 8)          s++;
  if (/[A-Z]/.test(pwd))        s++;
  if (/[0-9]/.test(pwd))        s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
};
const STRENGTH_BARS  = ["bg-red-400",    "bg-yellow-400",  "bg-blue-400",  "bg-green-500"];
const STRENGTH_TEXT  = ["text-red-500",  "text-yellow-500","text-blue-500","text-green-600"];
const STRENGTH_LABEL = ["Weak",          "Fair",           "Good",         "Strong"];

const validatePasswordStep = (f) => {
  const e = {};
  if (!f.password)
    e.password = "Password is required";
  else if (f.password.length < 8)
    e.password = "Minimum 8 characters";
  if (!f.confirmPassword)
    e.confirmPassword = "Please confirm your password";
  else if (f.password !== f.confirmPassword)
    e.confirmPassword = "Passwords do not match";
  return e;
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP INDICATOR  (2 steps: Details → Password)
// ─────────────────────────────────────────────────────────────────────────────
const StepIndicator = ({ step }) => (
  <div className="flex items-center w-full mb-8">
    {["Details", "Password"].map((label, i) => {
      const s       = i + 1;
      const done    = s < step;
      const current = s === step;
      return (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
              done    ? "bg-blue-600 border-blue-600 text-white" :
              current ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" :
                        "bg-white border-gray-300 text-gray-400"
            }`}>
              {done ? <CheckCircle size={15} /> : s}
            </div>
            <span className={`text-xs mt-1.5 font-medium ${
              current ? "text-blue-600" : done ? "text-blue-400" : "text-gray-400"
            }`}>{label}</span>
          </div>
          {s < 2 && (
            <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all ${
              step > 1 ? "bg-blue-600" : "bg-gray-200"
            }`} />
          )}
        </div>
      );
    })}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Password
// Receives detailsForm (Step 1 values) to render the summary card.
// Uses inputCls + Field imported from FacultyForm for visual consistency.
// ─────────────────────────────────────────────────────────────────────────────
const PasswordStep = ({ detailsForm, pwdForm, setPwdForm, errors }) => {
  const [showPwd,  setShowPwd]  = useState(false);
  const [showConf, setShowConf] = useState(false);
  const strength = pwdStrength(pwdForm.password);

  return (
    <div className="space-y-5">
      {/* Summary card — shows confirmed Step 1 values */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
        <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-3">
          Confirm details before setting password
        </p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          {[
            ["Name",        detailsForm.fullName],
            ["Email",       detailsForm.email],
            ["Department",  detailsForm.department],
            ["Role",        detailsForm.role],
            ["Designation", detailsForm.role === "HOD"
              ? "Head of Department"
              : detailsForm.designation],
          ].filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="flex flex-col">
              <span className="text-xs text-gray-400">{k}</span>
              <span className="text-sm font-medium text-gray-700 truncate">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Password + Confirm side-by-side */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Password" error={errors.password}>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
            <input
              type={showPwd ? "text" : "password"}
              value={pwdForm.password}
              onChange={(e) => setPwdForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Minimum 8 characters"
              className={`${inputCls(errors.password)} pl-10 pr-10`}
            />
            <button type="button" onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition">
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {pwdForm.password && (
            <div className="mt-1.5 space-y-1">
              <div className="flex gap-1">
                {[0,1,2,3].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                    i < strength ? STRENGTH_BARS[strength - 1] : "bg-gray-200"
                  }`} />
                ))}
              </div>
              <p className={`text-xs font-medium ${STRENGTH_TEXT[strength - 1]}`}>
                {STRENGTH_LABEL[strength - 1]}
              </p>
            </div>
          )}
        </Field>

        <Field label="Confirm Password" error={errors.confirmPassword}>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
            <input
              type={showConf ? "text" : "password"}
              value={pwdForm.confirmPassword}
              onChange={(e) => setPwdForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="Re-enter password"
              className={`${inputCls(errors.confirmPassword)} pl-10 pr-10`}
            />
            <button type="button" onClick={() => setShowConf((v) => !v)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition">
              {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {pwdForm.confirmPassword && pwdForm.password === pwdForm.confirmPassword && !errors.confirmPassword && (
            <p className="flex items-center gap-1 text-xs text-green-600 mt-0.5">
              <CheckCircle size={11} /> Passwords match
            </p>
          )}
        </Field>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────────────────────
const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium bg-white border ${
      toast.type === "success" ? "border-green-200 text-green-700" : "border-red-200 text-red-600"
    }`}>
      {toast.type === "success"
        ? <CheckCircle size={18} className="text-green-500" />
        : <AlertCircle size={18} className="text-red-400" />}
      {toast.message}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD — root
// ─────────────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  // ── Stats ─────────────────────────────────────────────────────────────────
  const [counts] = useState(MOCK_COUNTS); // swap for useState+useEffect (see comment above)

  // ── Step 1 — faculty details (driven by FacultyForm) ──────────────────────
  const [detailsForm,   setDetailsForm]   = useState(EMPTY_FACULTY_FORM);
  const [detailsErrors, setDetailsErrors] = useState({});

  // ── Step 2 — password (local to this page) ────────────────────────────────
  const [pwdForm,   setPwdForm]   = useState({ password: "", confirmPassword: "" });
  const [pwdErrors, setPwdErrors] = useState({});

  // ── Wizard state ──────────────────────────────────────────────────────────
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleNext = () => {
    const errs = validateFacultyForm(detailsForm, "add");
    if (Object.keys(errs).length) { setDetailsErrors(errs); return; }
    setDetailsErrors({});
    setStep(2);
  };

  const handleBack = () => {
    setDetailsErrors({});
    setPwdErrors({});
    setStep(1);
  };

  // ── API INTEGRATION: POST /api/admin/faculty ───────────────────────────────
  // Payload keys match the backend User mongoose schema exactly.
  // Token is pulled from sessionStorage (written by AuthContext at login).
  // ─────────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const errs = validatePasswordStep(pwdForm);
    if (Object.keys(errs).length) { setPwdErrors(errs); return; }
    setPwdErrors({});
    setLoading(true);

    const payload = {
      fullName:    detailsForm.fullName.trim(),
      email:       detailsForm.email.trim().toLowerCase(),
      password:    pwdForm.password,
      role:        detailsForm.role,
      department:  detailsForm.department,
      // Backend schema uses "Head of Department" string for HOD designation
      designation: detailsForm.role === "HOD"
        ? "Head of Department"
        : detailsForm.designation,
      subjects:    [], // subjects managed via a separate flow
    };

    try {
      const token = JSON.parse(sessionStorage.getItem("vit_user") ?? "{}")?.token;
      const res = await fetch("/api/admin/faculty", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        // Surface backend error e.g. 409 duplicate email
        showToast(data?.message || "Failed to add faculty.", "error");
        return;
      }

      showToast(`${detailsForm.fullName} added successfully!`);
      // Reset both steps
      setDetailsForm(EMPTY_FACULTY_FORM);
      setPwdForm({ password: "", confirmPassword: "" });
      setStep(1);
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Count cards config ─────────────────────────────────────────────────────
  const countCards = [
    { label: "Total Faculty in VIT", count: counts.total,  iconBg: "bg-blue-50 text-blue-500",   icon: <Users size={20} /> },
    { label: "INFT Department",      count: counts.INFT,   iconBg: "bg-emerald-50 text-emerald-500", icon: <BarChart2 size={20} /> },
    { label: "CMPN Department",      count: counts.CMPN,   iconBg: "bg-yellow-50 text-yellow-500",   icon: <Star size={20} /> },
    { label: "EXTC Department",      count: counts.EXTC,   iconBg: "bg-purple-50 text-purple-500",   icon: <GraduationCap size={20} /> },
    { label: "EXCS Department",      count: counts.EXCS,   iconBg: "bg-sky-50 text-sky-500",         icon: <Users size={20} /> },
    { label: "BIOMED Department",    count: counts.BIOMED, iconBg: "bg-rose-50 text-rose-500",       icon: <Heart size={20} /> },
    { label: "FE Department",        count: counts.FE,     iconBg: "bg-teal-50 text-teal-500",       icon: <Zap size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="ml-60 flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-8 py-8 space-y-8">

          {/* ── Institute Overview ─────────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Institute Overview</h2>
                <p className="text-sm text-gray-400">Live statistics across the institute</p>
              </div>
              <button className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:underline">
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
            <div className="flex gap-4">
              {countCards.map((c) => (
                <CountCard key={c.label} {...c} />
              ))}
            </div>
          </section>

          {/* ── Add Faculty — 2-step wizard ────────────────────────────────── */}
          <section>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-10 py-8">
              <StepIndicator step={step} />

              <div className="mb-7">
                <h2 className="text-xl font-bold text-gray-800">Add Faculty</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Register a new faculty member to the system
                </p>
              </div>

              {/* Step 1 — FacultyForm (from components/FacultyForm.jsx) */}
              {step === 1 && (
                <FacultyForm
                  form={detailsForm}
                  setForm={setDetailsForm}
                  errors={detailsErrors}
                  mode="add"
                />
              )}

              {/* Step 2 — Password (local to this page) */}
              {step === 2 && (
                <PasswordStep
                  detailsForm={detailsForm}
                  pwdForm={pwdForm}
                  setPwdForm={setPwdForm}
                  errors={pwdErrors}
                />
              )}

              {/* Navigation buttons */}
              <div className="flex gap-4 mt-8">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1 py-3 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Back
                  </button>
                )}

                {step === 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-200"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-200 disabled:opacity-60"
                  >
                    {loading
                      ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
                      : "Add Faculty Member"}
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