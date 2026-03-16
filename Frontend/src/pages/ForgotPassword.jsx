import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap, Mail, KeyRound, Lock, Eye, EyeOff,
  CheckCircle, AlertCircle, Loader2, ShieldCheck, RefreshCw,
} from "lucide-react";
import Footer from "../components/Footer";

// ───────────
// CONFIG — keep in sync with backend
// ───────────
const OTP_LENGTH  = 6;   // digits
const OTP_EXPIRY  = 60;  // seconds (1 minute as specified)

// ───────────
// SMALL ATOMS — match Login page visual language exactly
// ───────────
const inputCls = (err, disabled) =>
  `w-full py-2.5 pl-10 pr-3 text-sm border rounded-lg focus:outline-none focus:ring focus:border-0 transition ${
    disabled
      ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
      : err
        ? "bg-gray-50 border-red-300 focus:ring-red-400"
        : "bg-gray-50 border-gray-200 focus:ring-blue-500"
  }`;

const FieldError = ({ error }) =>
  error ? (
    <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
      <AlertCircle size={11} /> {error}
    </p>
  ) : null;

// Circular countdown ring — visually prominent 1-min timer
const CountdownRing = ({ seconds, total }) => {
  const r     = 20;
  const circ  = 2 * Math.PI * r;
  const pct   = seconds / total;
  const dash  = pct * circ;
  const urgent = seconds <= 15;
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg width="52" height="52" className="-rotate-90">
        {/* track */}
        <circle cx="26" cy="26" r={r} fill="none"
          stroke="#e5e7eb" strokeWidth="3.5" />
        {/* progress */}
        <circle cx="26" cy="26" r={r} fill="none"
          stroke={urgent ? "#ef4444" : "#2563EB"}
          strokeWidth="3.5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s linear, stroke 0.3s" }}
        />
      </svg>
      {/* overlay time text */}
      <span className={`text-xs font-bold font-mono -mt-8 mb-2 ${urgent ? "text-red-500" : "text-blue-600"}`}>
        {m}:{s}
      </span>
    </div>
  );
};

// Password strength
const pwdStrength = (pwd) => {
  if (!pwd) return null;
  let s = 0;
  if (pwd.length >= 8)          s++;
  if (/[A-Z]/.test(pwd))        s++;
  if (/[0-9]/.test(pwd))        s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
};
const BARS   = ["bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];
const TEXTS  = ["text-red-500", "text-yellow-500", "text-blue-500", "text-green-600"];
const LABELS = ["Weak", "Fair", "Good", "Strong"];

// ───────────
// FORGOT PASSWORD
// ───────────
// FLOW (single card, fields appear progressively):
//   Phase 1 — email input  + "Send OTP" button
//   Phase 2 — email locked + OTP input with countdown + "Verify OTP" button
//   Phase 3 — new password + confirm password + "Reset Password" button
//
// API ENDPOINTS:
//   POST /api/auth/forgot-password/send-otp
//     body:     { email }
//     200:      { message }       — OTP sent to email
//     404:      { message }       — email not registered
//     429:      { message }       — rate limited
//
//   POST /api/auth/forgot-password/verify-otp
//     body:     { email, otp }
//     200:      { message }       — OTP valid, proceed to reset
//     400:      { message }       — wrong or expired OTP
//
//   POST /api/auth/forgot-password/reset
//     body:     { email, otp, newPassword }
//     200:      { message }       — password updated
//     400/401:  { message }       — OTP re-validation failed or session expired
// ───────────

const ForgotPassword = () => {
  const navigate = useNavigate();

  // ── Phase: "email" | "otp" | "password" ──────────────
  const [phase, setPhase] = useState("email");

  // ── Phase 1 — email ───────────
  const [email,       setEmail]       = useState("");
  const [emailError,  setEmailError]  = useState("");
  const [sendLoading, setSendLoading] = useState(false);

  // ── Phase 2 — OTP ─────────────
  const [otp,           setOtp]           = useState("");
  const [otpError,      setOtpError]      = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [timeLeft,      setTimeLeft]      = useState(OTP_EXPIRY);
  const [expired,       setExpired]       = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const timerRef = useRef(null);

  // ── Phase 3 — new password ────
  const [password,     setPassword]     = useState("");
  const [confirm,      setConfirm]      = useState("");
  const [pwdErrors,    setPwdErrors]    = useState({});
  const [showPwd,      setShowPwd]      = useState(false);
  const [showConf,     setShowConf]     = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // ── Toast 
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Cleanup timer on unmount ──
  useEffect(() => () => clearInterval(timerRef.current), []);

  // ── Start / restart 60-second countdown 
  const startTimer = () => {
    clearInterval(timerRef.current);
    setTimeLeft(OTP_EXPIRY);
    setExpired(false);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setExpired(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  // ── SEND OTP ── POST /api/auth/forgot-password/send-otp ───────────────────
  const handleSendOtp = async (isResend = false) => {
    // Validate email before first send
    if (!isResend) {
      const trimmed = email.trim().toLowerCase();
      if (!trimmed)                     { setEmailError("Email is required.");          return; }
      if (!/\S+@\S+\.\S+/.test(trimmed)) { setEmailError("Enter a valid email address."); return; }
      setEmailError("");
    }

    isResend ? setResendLoading(true) : setSendLoading(true);

    try {
      const res  = await fetch("/api/auth/forgot-password/send-otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (isResend) {
          showToast(data?.message || "Failed to resend OTP.", "error");
        } else {
          setEmailError(data?.message || "No account found with this email.");
        }
        return;
      }

      setOtp("");
      setOtpError("");
      startTimer();
      setPhase("otp");
      showToast(isResend ? "New OTP sent!" : "OTP sent to your email.");
    } catch {
      const msg = "Network error. Please try again.";
      isResend ? showToast(msg, "error") : setEmailError(msg);
    } finally {
      isResend ? setResendLoading(false) : setSendLoading(false);
    }
  };

  // ── VERIFY OTP ── POST /api/auth/forgot-password/verify-otp ───────────────
  const handleVerifyOtp = async () => {
    if (otp.length < OTP_LENGTH) { setOtpError(`Enter all ${OTP_LENGTH} digits.`); return; }
    setOtpError("");
    setVerifyLoading(true);

    try {
      const res  = await fetch("/api/auth/forgot-password/verify-otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim().toLowerCase(), otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setOtpError(data?.message || "Invalid or expired OTP.");
        return;
      }
      clearInterval(timerRef.current);
      setPhase("password");
    } catch {
      setOtpError("Network error. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
  };

  // ── RESET PASSWORD ── POST /api/auth/forgot-password/reset ────────────────
  const handleReset = async () => {
    const errs = {};
    if (!password)              errs.password = "Password is required.";
    else if (password.length < 8) errs.password = "Minimum 8 characters.";
    if (!confirm)               errs.confirm  = "Please confirm your password.";
    else if (password !== confirm) errs.confirm = "Passwords do not match.";
    if (Object.keys(errs).length) { setPwdErrors(errs); return; }
    setPwdErrors({});
    setResetLoading(true);

    try {
      const res  = await fetch("/api/auth/forgot-password/reset", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          email:       email.trim().toLowerCase(),
          otp,          // backend re-validates OTP before committing
          newPassword: password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data?.message || "Failed to reset password.", "error");
        return;
      }
      showToast("Password reset! Redirecting to login…");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setResetLoading(false);
    }
  };

  const strength = pwdStrength(password);

  // ───────
  // RENDER
  // ───────
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-8">
      <div className="w-full max-w-md">

        {/* ── Institute header — identical to Login ──────────────────── */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <div className="bg-blue-100 p-3 rounded-lg">
              <GraduationCap color="#2563EB" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-800">
            Vidyalankar Institute of Technology
          </h1>
          <p className="text-gray-500 text-sm">Feedback Portal System</p>
        </div>

        {/* ── Card ──────── */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-5">

          {/* Heading changes per phase */}
          <div className="text-center mb-2">
            <div className="flex justify-center mb-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                phase === "password" ? "bg-green-50" : "bg-blue-50"
              }`}>
                {phase === "email"    && <Mail     size={22} className="text-blue-600" />}
                {phase === "otp"      && <KeyRound size={22} className="text-blue-600" />}
                {phase === "password" && <Lock     size={22} className="text-green-600" />}
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              {phase === "email"    && "Forgot Password?"}
              {phase === "otp"      && "Verify OTP"}
              {phase === "password" && "Set New Password"}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {phase === "email"    && "Enter your registered email to receive an OTP."}
              {phase === "otp"      && `A ${OTP_LENGTH}-digit OTP was sent to your email.`}
              {phase === "password" && "Choose a strong password for your account."}
            </p>
          </div>

          {/* ── PHASE: email + otp (same card, otp appears below) ────── */}
          {phase !== "password" && (
            <>
              {/* Email input */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Registered Email ID
                </label>
                <div className="relative mt-1">
                  <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && phase === "email" && handleSendOtp(false)}
                    placeholder="e.g. rajesh.kumar@vit.edu.in"
                    disabled={phase === "otp"}
                    className={inputCls(!!emailError, phase === "otp")}
                    autoFocus={phase === "email"}
                  />
                </div>
                <FieldError error={emailError} />
              </div>

              {/* OTP input — only visible in otp phase */}
              {phase === "otp" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700">
                      Enter OTP
                    </label>
                    {/* Countdown ring positioned to the right of label */}
                    <CountdownRing seconds={timeLeft} total={OTP_EXPIRY} />
                  </div>

                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={OTP_LENGTH}
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH));
                        setOtpError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && !expired && handleVerifyOtp()}
                      placeholder={expired ? "OTP expired — resend below" : `Enter ${OTP_LENGTH}-digit OTP`}
                      disabled={expired || verifyLoading}
                      autoFocus
                      className={`${inputCls(!!otpError, expired)} pl-10 tracking-[0.3em] font-mono text-center`}
                    />
                  </div>
                  <FieldError error={otpError} />

                  {/* Hint line */}
                  {!expired ? (
                    <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <ShieldCheck size={11} /> Check your inbox (and spam folder).
                    </p>
                  ) : (
                    <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                      <AlertCircle size={11} /> OTP expired.
                    </p>
                  )}
                </div>
              )}

              {/* ── Action buttons ───────────────── */}
              {phase === "email" && (
                <button
                  type="button"
                  onClick={() => handleSendOtp(false)}
                  disabled={sendLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {sendLoading
                    ? <><Loader2 size={16} className="animate-spin" /> Sending OTP…</>
                    : <><Mail size={15} /> Send OTP</>}
                </button>
              )}

              {phase === "otp" && (
                <div className="space-y-2.5">
                  {/* Verify button */}
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifyLoading || expired || otp.length < OTP_LENGTH}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifyLoading
                      ? <><Loader2 size={16} className="animate-spin" /> Verifying…</>
                      : <><CheckCircle size={15} /> Verify OTP</>}
                  </button>

                  {/* Resend — visible only when expired */}
                  {expired && (
                    <button
                      type="button"
                      onClick={() => handleSendOtp(true)}
                      disabled={resendLoading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 border border-blue-600 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
                    >
                      {resendLoading
                        ? <><Loader2 size={15} className="animate-spin" /> Resending…</>
                        : <><RefreshCw size={14} /> Resend OTP</>}
                    </button>
                  )}

                  {/* Change email */}
                  <button
                    type="button"
                    onClick={() => {
                      clearInterval(timerRef.current);
                      setPhase("email");
                      setOtp("");
                      setOtpError("");
                      setExpired(false);
                    }}
                    className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition py-1"
                  >
                    ← Use a different email
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── PHASE: new password ───────────────── */}
          {phase === "password" && (
            <>
              {/* Verified email badge */}
              <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                <CheckCircle size={14} className="text-green-500 shrink-0" />
                <p className="text-xs text-green-700 truncate">
                  OTP verified for <span className="font-semibold">{email}</span>
                </p>
              </div>

              {/* New password */}
              <div>
                <label className="text-sm font-medium text-gray-700">New Password</label>
                <div className="relative mt-1">
                  <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPwdErrors((p) => ({ ...p, password: "" })); }}
                    placeholder="Minimum 8 characters"
                    autoFocus
                    className={inputCls(!!pwdErrors.password, false)}
                  />
                  <button type="button" onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <FieldError error={pwdErrors.password} />

                {/* Strength bar */}
                {password && strength !== null && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[0,1,2,3].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                          i < strength ? BARS[strength - 1] : "bg-gray-200"
                        }`} />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${TEXTS[strength - 1]}`}>
                      {LABELS[strength - 1]}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative mt-1">
                  <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type={showConf ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setPwdErrors((p) => ({ ...p, confirm: "" })); }}
                    onKeyDown={(e) => e.key === "Enter" && handleReset()}
                    placeholder="Re-enter your new password"
                    className={inputCls(!!pwdErrors.confirm, false)}
                  />
                  <button type="button" onClick={() => setShowConf((v) => !v)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition">
                    {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <FieldError error={pwdErrors.confirm} />
                {confirm && password === confirm && !pwdErrors.confirm && (
                  <p className="flex items-center gap-1 text-xs text-green-600 mt-1">
                    <CheckCircle size={11} /> Passwords match
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleReset}
                disabled={resetLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
              >
                {resetLoading
                  ? <><Loader2 size={16} className="animate-spin" /> Resetting…</>
                  : <><CheckCircle size={15} /> Reset Password</>}
              </button>
            </>
          )}

          {/* ── Back to login ─ */}
          <div className="text-center pt-1">
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back to Login
            </button>
          </div>
        </div>

        <Footer />
      </div>

      {/* ── Toast ────────── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-medium bg-white border ${
          toast.type === "success" ? "border-green-200 text-green-700" : "border-red-200 text-red-600"
        }`}>
          {toast.type === "success"
            ? <CheckCircle size={17} className="text-green-500" />
            : <AlertCircle size={17} className="text-red-400" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;