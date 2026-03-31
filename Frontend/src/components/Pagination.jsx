import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, totalPages, onPage }) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-between mt-6 sm:mt-8 flex-wrap gap-3">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 font-medium cursor-pointer text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ fontSize: "clamp(0.72rem, 1.4vw, 0.875rem)" }}>
        <ChevronLeft size={14} /> Back
      </button>
      <div className="flex items-center gap-1 sm:gap-1.5">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`rounded-xl font-semibold transition ${p === page ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-gray-500 hover:bg-gray-100"}`}
            style={{
              width: "clamp(2rem, 3vw, 2.25rem)",
              height: "clamp(2rem, 3vw, 2.25rem)",
              fontSize: "clamp(0.72rem, 1.4vw, 0.875rem)",
            }}>
            {p}
          </button>
        ))}
      </div>
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 font-medium cursor-pointer text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ fontSize: "clamp(0.72rem, 1.4vw, 0.875rem)" }}>
        Next <ChevronRight size={14} />
      </button>
    </div>
  );
};

export default Pagination;
