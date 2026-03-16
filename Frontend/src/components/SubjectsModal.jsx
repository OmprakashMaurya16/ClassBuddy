// ─────────────────────────────────────────────────────────────────────────────
// components/SubjectsModal.jsx
//
// Manages subjects for a single faculty member.
// Shows the subject list with inline Edit / Delete per row.
// "Add Subject" button at the top opens an inline form.
//
// PROPS
//   open             boolean
//   onClose          () => void
//   faculty          object | null  — { _id, fullName, subjects[] }
//   onFacultyUpdate  (id, patch) => void  — lift updated subjects to parent
//   showToast        (msg, type?) => void — from parent toast system
//
// API ENDPOINTS (all require Bearer token from sessionStorage "vit_user")
//   POST   /api/admin/faculty/:id/subjects      add a subject
//   PUT    /api/admin/subjects/:subjectId        edit a subject
//   DELETE /api/admin/subjects/:subjectId        delete a subject
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  X, Plus, Pencil, Trash2,
  CheckCircle, AlertCircle, Loader2, BookMarked,
} from "lucide-react";
import { DEPARTMENTS, inputCls, Field } from "./FacultyForm";

// ─── Constants ────────────────────────────────────────────────────────────────
const SEMESTERS    = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
const EMPTY_SUBJECT = { name: "", code: "", semester: "", department: "" };

// ─── Auth token helper ────────────────────────────────────────────────────────
const getToken = () =>
  JSON.parse(sessionStorage.getItem("vit_user") ?? "{}")?.token;

// ─── Validation ───────────────────────────────────────────────────────────────
const validateSubject = (f) => {
  const e = {};
  if (!f.name.trim())  e.name       = "Subject name is required";
  if (!f.code.trim())  e.code       = "Subject code is required";
  if (!f.semester)     e.semester   = "Semester is required";
  if (!f.department)   e.department = "Department is required";
  return e;
};

// ─── Modal Shell ──────────────────────────────────────────────────────────────
const ModalShell = ({ title, onClose, children }) => {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// ─── Subject Form (add + edit) ────────────────────────────────────────────────
const SubjectForm = ({ initial = EMPTY_SUBJECT, onSave, onCancel, loading }) => {
  const [form,   setForm]   = useState({ ...initial });
  const [errors, setErrors] = useState({});

  // Re-sync when initial changes (edit mode switches subject)
  useEffect(() => { setForm({ ...initial }); setErrors({}); }, [initial]);

  const handleSave = () => {
    const errs = validateSubject(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Subject Name" error={errors.name}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Data Structures"
            className={inputCls(errors.name)}
          />
        </Field>

        <Field label="Subject Code" error={errors.code}>
          <input
            type="text"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            placeholder="e.g. INFT301"
            className={inputCls(errors.code)}
          />
        </Field>

        <Field label="Semester" error={errors.semester}>
          <select
            value={form.semester}
            onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
            className={`${inputCls(errors.semester)} ${!form.semester ? "text-gray-400" : "text-gray-800"} cursor-pointer`}
          >
            <option value="" disabled>Select Semester</option>
            {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>

        <Field label="Department" error={errors.department}>
          <select
            value={form.department}
            onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            className={`${inputCls(errors.department)} ${!form.department ? "text-gray-400" : "text-gray-800"} cursor-pointer`}
          >
            <option value="" disabled>Select Department</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {loading
            ? <Loader2 size={15} className="animate-spin" />
            : <CheckCircle size={15} />}
          Save Subject
        </button>
      </div>
    </div>
  );
};

// ─── SubjectsModal (exported) ─────────────────────────────────────────────────
const SubjectsModal = ({ open, onClose, faculty, onFacultyUpdate, showToast }) => {
  const [subjects,       setSubjects]       = useState([]);
  const [addingNew,      setAddingNew]      = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [loadingAdd,     setLoadingAdd]     = useState(false);
  const [savingId,       setSavingId]       = useState(null);
  const [deletingId,     setDeletingId]     = useState(null);

  // Sync subjects list every time the modal opens / faculty changes
  useEffect(() => {
    if (open && faculty) {
      setSubjects(faculty.subjects ?? []);
      setAddingNew(false);
      setEditingSubject(null);
    }
  }, [open, faculty]);

  if (!open || !faculty) return null;

  // Helper — updates local state + lifts to parent in one call
  const sync = (updated) => {
    setSubjects(updated);
    onFacultyUpdate(faculty._id, { subjects: updated });
  };

  // ── ADD ── POST /api/admin/faculty/:id/subjects ────────────────────────────
  // Body:     { name, code, semester, department }
  // Response: { message, subject: { _id, name, code, semester, department } }
  const handleAdd = async (formData) => {
    setLoadingAdd(true);
    try {
      const token = getToken();
      const res   = await fetch(`/api/admin/faculty/${faculty._id}/subjects`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data?.message || "Failed to add subject.", "error"); return; }
      // Use server-returned subject (has real _id); fallback for dev without backend
      sync([...subjects, data.subject ?? { ...formData, _id: Date.now().toString() }]);
      showToast("Subject added successfully!");
      setAddingNew(false);
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoadingAdd(false);
    }
  };

  // ── EDIT ── PUT /api/admin/subjects/:subjectId ─────────────────────────────
  // Body:     { name, code, semester, department }
  // Response: { message, subject }
  const handleEditSave = async (formData) => {
    setSavingId(editingSubject._id);
    try {
      const token = getToken();
      const res   = await fetch(`/api/admin/subjects/${editingSubject._id}`, {
        method:  "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data?.message || "Failed to update subject.", "error"); return; }
      sync(subjects.map((s) =>
        s._id === editingSubject._id ? { ...s, ...formData } : s
      ));
      showToast("Subject updated successfully!");
      setEditingSubject(null);
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setSavingId(null);
    }
  };

  // ── DELETE ── DELETE /api/admin/subjects/:subjectId ────────────────────────
  // Response: { message }
  const handleDelete = async (subjectId) => {
    setDeletingId(subjectId);
    try {
      const token = getToken();
      const res   = await fetch(`/api/admin/subjects/${subjectId}`, {
        method:  "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (!res.ok) { showToast(data?.message || "Failed to delete subject.", "error"); return; }
      sync(subjects.filter((s) => s._id !== subjectId));
      showToast("Subject deleted.");
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ModalShell
      title={`Subjects — ${faculty.fullName}`}
      onClose={onClose}
    >
      {/* Add Subject button — hidden while a form is open */}
      {!addingNew && !editingSubject && (
        <button
          onClick={() => setAddingNew(true)}
          className="flex items-center gap-2 mb-5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition"
        >
          <Plus size={15} /> Add Subject
        </button>
      )}

      {/* Inline Add form */}
      {addingNew && (
        <div className="mb-5 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-3">
            New Subject
          </p>
          <SubjectForm
            onSave={handleAdd}
            onCancel={() => setAddingNew(false)}
            loading={loadingAdd}
          />
        </div>
      )}

      {/* Empty state */}
      {subjects.length === 0 && !addingNew ? (
        <div className="flex flex-col items-center py-10 text-gray-300">
          <BookMarked size={30} className="mb-2" />
          <p className="text-sm">No subjects assigned yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {subjects.map((s) => (
            <div key={s._id}>
              {/* Inline edit form */}
              {editingSubject?._id === s._id ? (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-3">
                    Edit Subject
                  </p>
                  <SubjectForm
                    initial={s}
                    onSave={handleEditSave}
                    onCancel={() => setEditingSubject(null)}
                    loading={savingId === s._id}
                  />
                </div>
              ) : (
                /* Subject row */
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{s.name}</p>
                    <p className="text-xs text-gray-400">
                      {s.code} · Sem {s.semester} · {s.department}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-3 shrink-0">
                    <button
                      onClick={() => { setEditingSubject(s); setAddingNew(false); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                      title="Edit subject"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      disabled={deletingId === s._id}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition disabled:opacity-50"
                      title="Delete subject"
                    >
                      {deletingId === s._id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </ModalShell>
  );
};

export default SubjectsModal;