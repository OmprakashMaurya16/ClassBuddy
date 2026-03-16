// ─────────────────────────────────────────────────────────────────────────────
// components/FacultyForm.jsx
//
// Step 1 of the Add Faculty flow — and the entire form for Edit/Update.
// Self-contained: owns its state via props (form / setForm / errors).
//
// EXPORTS
//   default  FacultyForm          – the rendered form UI
//   named    DEPARTMENTS          – enum array (matches backend)
//   named    DESIGNATIONS         – enum array (matches backend)
//   named    EMPTY_FACULTY_FORM   – initial form shape
//   named    validateFacultyForm  – validator fn (mode "add" | "edit")
//   named    inputCls             – shared Tailwind input class helper
//   named    Field                – shared label + error wrapper
//
// PROPS
//   form      { fullName, email, department, designation, role }
//   setForm   state setter
//   errors    { fullName?, email?, department?, designation?, role? }
//   mode      "add" (default) | "edit"
//             "edit" → email is read-only (changing email needs a separate flow)
// ─────────────────────────────────────────────────────────────────────────────

import { User, Mail, Shield, AlertCircle } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS — must match backend User model enums exactly
// ─────────────────────────────────────────────────────────────────────────────
export const DEPARTMENTS = ["INFT", "CMPN", "EXTC", "EXCS", "BIOMED", "FE"];

export const DESIGNATIONS = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecturer",
  "Guest Faculty",
];

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL FORM SHAPE
// Import this wherever you need useState(EMPTY_FACULTY_FORM)
// ─────────────────────────────────────────────────────────────────────────────
export const EMPTY_FACULTY_FORM = {
  fullName:    "",
  email:       "",
  department:  "",
  designation: "",
  role:        "Faculty",
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI ATOMS
// Exported so pages that extend the form (e.g. AdminDashboard's PasswordStep)
// can stay visually consistent without duplicating styles.
// ─────────────────────────────────────────────────────────────────────────────
export const inputCls = (err) =>
  `w-full px-4 py-3 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
    err ? "border-red-300 focus:ring-red-400" : "border-gray-200 focus:ring-blue-400"
  }`;

export const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-600">{label}</label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-500 mt-0.5">
        <AlertCircle size={11} /> {error}
      </p>
    )}
  </div>
);

// Internal — not exported (only used inside this file)
const Select = ({ value, onChange, options, placeholder, error, disabled }) => (
  <select
    value={value}
    onChange={onChange}
    disabled={disabled}
    className={`${inputCls(error)} ${
      !value ? "text-gray-400" : "text-gray-800"
    } ${disabled ? "bg-gray-50 cursor-not-allowed text-gray-400" : "cursor-pointer"}`}
  >
    <option value="" disabled>{placeholder}</option>
    {options.map((o) => (
      <option key={o} value={o} className="text-gray-800">{o}</option>
    ))}
  </select>
);

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION
// mode = "add"  → validates email (required + format)
// mode = "edit" → skips email (read-only, cannot be changed post-registration)
// ─────────────────────────────────────────────────────────────────────────────
export const validateFacultyForm = (f, mode = "add") => {
  const e = {};

  if (!f.fullName.trim())
    e.fullName = "Full name is required";
  else if (f.fullName.trim().length < 3)
    e.fullName = "Name must be at least 3 characters";
  else if (f.fullName.trim().length > 50)
    e.fullName = "Name must be under 50 characters";

  if (mode === "add") {
    if (!f.email.trim())
      e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(f.email))
      e.email = "Enter a valid email address";
  }

  if (!f.department)
    e.department = "Department is required";

  if (!f.role)
    e.role = "Role is required";

  // Designation required only for Faculty — HOD gets "Head of Department" automatically
  if (f.role === "Faculty" && !f.designation)
    e.designation = "Designation is required";

  return e; // empty object = valid
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const FacultyForm = ({ form, setForm, errors = {}, mode = "add" }) => {
  const handleRoleChange = (e) =>
    // Reset designation when switching roles so stale value isn't submitted
    setForm((f) => ({ ...f, role: e.target.value, designation: "" }));

  return (
    <div className="space-y-5">

      {/* Row 1 — Name + Email */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Faculty Name" error={errors.fullName}>
          <div className="relative">
            <User size={15} className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              placeholder="e.g. Dr. Rajesh Kumar"
              className={`${inputCls(errors.fullName)} pl-10`}
            />
          </div>
        </Field>

        <Field label="Email ID" error={errors.email}>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="e.g. rajesh.kumar@vit.edu.in"
              readOnly={mode === "edit"}
              className={`${inputCls(errors.email)} pl-10 ${
                mode === "edit" ? "bg-gray-50 text-gray-400 cursor-not-allowed select-none" : ""
              }`}
            />
          </div>
          {mode === "edit" && (
            <p className="text-xs text-gray-400 -mt-0.5">
              Email cannot be changed after registration.
            </p>
          )}
        </Field>
      </div>

      {/* Row 2 — Department + Designation */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Department" error={errors.department}>
          <Select
            value={form.department}
            onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            options={DEPARTMENTS}
            placeholder="Select Department"
            error={errors.department}
          />
        </Field>

        <Field label="Designation" error={errors.designation}>
          {form.role === "HOD" ? (
            // Auto-filled and locked for HOD — sent as "Head of Department" to backend
            <input
              type="text"
              value="Head of Department"
              disabled
              className={`${inputCls(false)} bg-gray-50 text-gray-400 cursor-not-allowed`}
            />
          ) : (
            <Select
              value={form.designation}
              onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
              options={DESIGNATIONS}
              placeholder="Select Designation"
              error={errors.designation}
            />
          )}
        </Field>
      </div>

      {/* Row 3 — Role (full width) */}
      <Field label="Role" error={errors.role}>
        <div className="relative">
          <Shield size={15} className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none z-10" />
          <select
            value={form.role}
            onChange={handleRoleChange}
            className={`${inputCls(errors.role)} pl-10 text-gray-800 cursor-pointer`}
          >
            <option value="Faculty">Faculty</option>
            <option value="HOD">HOD</option>
          </select>
        </div>
      </Field>

    </div>
  );
};

export default FacultyForm;