import { BookOpen, Pencil, Trash2, ChevronRight } from "lucide-react";
const DEPT_COLOURS = {
  INFT: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    badge: "text-emerald-600",
  },
  CMPN: {
    bg: "bg-violet-100",
    text: "text-violet-700",
    badge: "text-violet-600",
  },
  EXTC: { bg: "bg-amber-100", text: "text-amber-700", badge: "text-amber-600" },
  EXCS: { bg: "bg-teal-100", text: "text-teal-700", badge: "text-teal-600" },
  BIOMED: { bg: "bg-pink-100", text: "text-pink-700", badge: "text-pink-600" },
  FE: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    badge: "text-orange-600",
  },
};
const DEFAULT_COLOUR = {
  bg: "bg-gray-100",
  text: "text-gray-600",
  badge: "text-gray-500",
};

export const deptColour = (dept) => DEPT_COLOURS[dept] ?? DEFAULT_COLOUR;
const HONORIFICS = new Set(["dr", "prof", "mr", "mrs", "ms", "dr."]);

export const initials = (name) =>
  name
    .split(" ")
    .filter(
      (w) => w.length > 0 && !HONORIFICS.has(w.toLowerCase().replace(".", "")),
    )
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
const FacultyCard = ({
  faculty,
  showActions = true,
  onSubjects = () => {},
  onEdit = () => {},
  onDelete = () => {},
  showViewDetails = false,
  onViewDetails = () => {},
}) => {
  const colours = deptColour(faculty.department);
  const abbr = initials(faculty.fullName);
  const subjectNames = (faculty.subjects ?? []).map((s) => s.name);
  const preview = subjectNames.slice(0, 2).join(", ");
  const hasMore = subjectNames.length > 2;
  const hasSubjects = subjectNames.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200 w-full h-full">
      <div className="flex items-start justify-between gap-2">
        <div
          className={`rounded-full flex items-center justify-center font-bold shrink-0 ${colours.bg} ${colours.text}`}
          style={{
            width: "clamp(2.5rem, 4vw, 3rem)",
            height: "clamp(2.5rem, 4vw, 3rem)",
            fontSize: "clamp(0.75rem, 1.3vw, 0.875rem)",
          }}>
          {abbr}
        </div>
        {showActions && (
          <div className="flex items-center gap-0.5   shrink-0">
            <button
              onClick={() => onSubjects(faculty)}
              title="Subjects"
              className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer">
              <BookOpen
                style={{
                  width: "clamp(13px, 1.3vw, 16px)",
                  height: "clamp(13px, 1.3vw, 16px)",
                }}
              />
            </button>
            <button
              onClick={() => onEdit(faculty)}
              title="Edit"
              className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer">
              <Pencil
                style={{
                  width: "clamp(13px, 1.3vw, 16px)",
                  height: "clamp(13px, 1.3vw, 16px)",
                }}
              />
            </button>
            <button
              onClick={() => onDelete(faculty)}
              title="Delete"
              className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer">
              <Trash2
                style={{
                  width: "clamp(13px, 1.3vw, 16px)",
                  height: "clamp(13px, 1.3vw, 16px)",
                }}
              />
            </button>
          </div>
        )}
      </div>

      <div>
        <p
          className="font-bold text-gray-800 leading-snug"
          style={{ fontSize: "clamp(0.78rem, 1.4vw, 0.875rem)" }}>
          {faculty.fullName}
        </p>
        <p
          className={`font-semibold uppercase tracking-wide mt-0.5 ${colours.badge}`}
          style={{ fontSize: "clamp(0.6rem, 1.1vw, 0.7rem)" }}>
          {faculty.department}
        </p>
      </div>

      <div
        className="text-gray-500 space-y-0.5"
        style={{ fontSize: "clamp(0.7rem, 1.2vw, 0.78rem)" }}>
        <p>
          <span className="text-gray-400">Role: </span>
          {faculty.role === "HOD"
            ? "Prof & HOD"
            : (faculty.designation ?? faculty.role)}
        </p>
        <p
          className={`truncate ${hasSubjects ? "" : "opacity-0 select-none"}`}
          aria-hidden={!hasSubjects}>
          <span className="text-gray-400">Subj: </span>
          {hasSubjects ? preview : "—"}
          {hasSubjects && hasMore ? ", …" : ""}
        </p>
      </div>
      {showViewDetails && (
        <button
          onClick={() => onViewDetails(faculty)}
          className="mt-auto w-full flex items-center justify-center gap-1.5 py-2.5 cursor-pointer bg-gray-50 border-t border-gray-100 rounded-xl text-gray-600 font-medium hover:bg-indigo-50 hover:text-indigo-600 transition"
          style={{ fontSize: "clamp(0.75rem, 1.4vw, 0.85rem)" }}>
          View Details <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
};

export default FacultyCard;
