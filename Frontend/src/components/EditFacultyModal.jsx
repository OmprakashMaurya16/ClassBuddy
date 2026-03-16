// ─────────────────────────────────────────────────────────────────────────────
// components/EditFacultyModal.jsx
//
// Modal popup that pre-fills FacultyForm with existing faculty data.
// Email is read-only (mode="edit"). No password fields.
//
// PROPS
//   open             boolean
//   onClose          () => void
//   faculty          object | null  — full faculty record to pre-fill
//   onFacultyUpdate  (id, patch) => void  — lift saved changes to parent
//   showToast        (msg, type?) => void
//
// API ENDPOINT
//   PUT /api/admin/faculty/:id
//   Body:     { fullName, department, designation, role }
//   Response: { message, faculty }
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { X, CheckCircle, Loader2 } from "lucide-react";
import FacultyForm, {
  EMPTY_FACULTY_FORM,
  validateFacultyForm,
} from "./FacultyForm";

// Auth token helper
const getToken = () =>
  JSON.parse(sessionStorage.getItem("vit_user") ?? "{}")?.token;

const EditFacultyModal = ({
  open,
  onClose,
  faculty,
  onFacultyUpdate,
  showToast,
}) => {
  const [form,    setForm]    = useState(EMPTY_FACULTY_FORM);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  // Pre-fill form whenever the target faculty changes
  useEffect(() => {
    if (faculty) {
      setForm({
        fullName:    faculty.fullName    ?? "",
        email:       faculty.email       ?? "",
        department:  faculty.department  ?? "",
        designation: faculty.designation ?? "",
        role:        faculty.role        ?? "Faculty",
      });
      setErrors({});
    }
  }, [faculty]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open || !faculty) return null;

  // ── SAVE ── PUT /api/admin/faculty/:id ─────────────────────────────────────
  // Sends only editable fields — email and password are excluded.
  // Designation is auto-set to "Head of Department" for HOD role.
  const handleSave = async () => {
    const errs = validateFacultyForm(form, "edit");
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const payload = {
      fullName:    form.fullName.trim(),
      department:  form.department,
      designation: form.role === "HOD" ? "Head of Department" : form.designation,
      role:        form.role,
    };

    try {
      const token = getToken();
      const res   = await fetch(`/api/admin/faculty/${faculty._id}`, {
        method:  "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data?.message || "Failed to update faculty.", "error");
        return;
      }
      onFacultyUpdate(faculty._id, payload);
      showToast(`${form.fullName} updated successfully!`);
      onClose();
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">Edit Faculty</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">
          {/* FacultyForm in edit mode — email is read-only, no password */}
          <FacultyForm
            form={form}
            setForm={setForm}
            errors={errors}
            mode="edit"
          />

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200 disabled:opacity-60"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
                : <><CheckCircle size={15} /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFacultyModal;