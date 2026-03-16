// ─────────────────────────────────────────────────────────────────────────────
// components/Pagination.jsx
//
// Reusable numbered pagination bar with Back / Next buttons.
// Works for any list page — pass the correct page / totalPages / onPage.
//
// PROPS
//   page        number   — current active page (1-based)
//   totalPages  number   — total number of pages
//   onPage      (p: number) => void — called with the target page number
// ─────────────────────────────────────────────────────────────────────────────

import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, totalPages, onPage }) => {
  if (totalPages <= 1) return null; // nothing to paginate

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between mt-8">
      {/* Back */}
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={15} /> Back
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1.5">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`w-9 h-9 rounded-xl text-sm font-semibold transition ${
              p === page
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Next */}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next <ChevronRight size={15} />
      </button>
    </div>
  );
};

export default Pagination;