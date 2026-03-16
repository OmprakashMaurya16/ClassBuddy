// ─────────────────────────────────────────────────────────────────────────────
// components/FacultyCard.jsx
//
// Reusable faculty card used in:
//   - Admin  → ManageFaculty  (showActions=true  — subjects, edit, delete)
//   - HOD    → future page    (showActions=false — read-only view)
//
// PROPS
//   faculty      { _id, fullName, email, department, role, designation, subjects[] }
//   showActions  boolean (default true)
//               When false: action buttons are hidden entirely — safe for HOD view
//   onSubjects   (faculty) => void   — opens subjects modal
//   onEdit       (faculty) => void   — opens edit modal
//   onDelete     (faculty) => void   — opens delete confirm modal
// ─────────────────────────────────────────────────────────────────────────────

import { BookOpen, Pencil, Trash2 } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// DEPARTMENT → AVATAR COLOUR MAP
// One fixed colour per department — easy to differentiate at a glance.
// No blue, red, or black as instructed.
// ─────────────────────────────────────────────────────────────────────────────
const DEPT_COLOURS = {
  INFT:  { bg: "bg-emerald-100", text: "text-emerald-700", badge: "text-emerald-600" },
  CMPN:  { bg: "bg-violet-100",  text: "text-violet-700",  badge: "text-violet-600"  },
  EXTC:  { bg: "bg-amber-100",   text: "text-amber-700",   badge: "text-amber-600"   },
  EXCS:  { bg: "bg-teal-100",    text: "text-teal-700",    badge: "text-teal-600"    },
  BIOMED:{ bg: "bg-pink-100",    text: "text-pink-700",    badge: "text-pink-600"    },
  FE:    { bg: "bg-orange-100",  text: "text-orange-700",  badge: "text-orange-600"  },
};

// Fallback for any dept not in the map
const DEFAULT_COLOUR = { bg: "bg-gray-100", text: "text-gray-600", badge: "text-gray-500" };

export const deptColour = (dept) => DEPT_COLOURS[dept] ?? DEFAULT_COLOUR;

// ─────────────────────────────────────────────────────────────────────────────
// INITIALS — first letter of first two meaningful words
// e.g. "Dr. Sarah Jenkins" → "SJ"  |  "Prof. Ravi Sharma" → "RS"
// ─────────────────────────────────────────────────────────────────────────────
const HONORIFICS = new Set(["dr", "prof", "mr", "mrs", "ms", "dr."]);

export const initials = (name) =>
  name
    .split(" ")
    .filter((w) => w.length > 0 && !HONORIFICS.has(w.toLowerCase().replace(".", "")))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const FacultyCard = ({
  faculty,
  showActions = true,
  onSubjects = () => {},
  onEdit     = () => {},
  onDelete   = () => {},
}) => {
  const colours      = deptColour(faculty.department);
  const abbr         = initials(faculty.fullName);
  const subjectNames = (faculty.subjects ?? []).map((s) => s.name);
  const preview      = subjectNames.slice(0, 2).join(", ");
  const hasMore      = subjectNames.length > 2;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">

      {/* ── Top row: avatar + action buttons ─────────────────────────── */}
      <div className="flex items-start justify-between">
        {/* Avatar — colour keyed to department */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${colours.bg} ${colours.text}`}>
          {abbr}
        </div>

        {/* Action buttons — only rendered for Admin (showActions=true) */}
        {showActions && (
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onSubjects(faculty)}
              title="View / manage subjects"
              className="p-2 rounded-lg cursor-pointer text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
            >
              <BookOpen size={16} />
            </button>
            <button
              onClick={() => onEdit(faculty)}
              title="Edit faculty"
              className="p-2 rounded-lg cursor-pointer text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => onDelete(faculty)}
              title="Delete faculty"
              className="p-2 rounded-lg cursor-pointer text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ── Name + department badge ───────────────────────────────────── */}
      <div>
        <p className="text-sm font-bold text-gray-800 leading-snug">{faculty.fullName}</p>
        <p className={`text-xs font-semibold uppercase tracking-wide mt-0.5 ${colours.badge}`}>
          {faculty.department}
        </p>
      </div>

      {/* ── Details ──────────────────────────────────────────────────── */}
      <div className="text-xs text-gray-500 space-y-0.5">
        <p>
          <span className="text-gray-400">Role: </span>
          {faculty.role === "HOD"
            ? "Prof & HOD"
            : faculty.designation ?? faculty.role}
        </p>
        {subjectNames.length > 0 && (
          <p className="truncate">
            <span className="text-gray-400">Subj: </span>
            {preview}{hasMore ? ", …" : ""}
          </p>
        )}
      </div>

    </div>
  );
};

export default FacultyCard;