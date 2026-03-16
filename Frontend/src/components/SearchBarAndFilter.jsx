// ─────────────────────────────────────────────────────────────────────────────
// components/SearchBarAndFilter.jsx
//
// Search input + Department dropdown filter row.
// Reusable for any page that needs to filter a faculty list by text + dept.
//
// PROPS
//   search        string              — controlled search value
//   onSearch      (value) => void     — called on every keystroke
//   dept          string              — selected department ("" = All)
//   onDept        (value) => void     — called when department changes
//   departments   string[]            — list of dept options
//   placeholder   string              — search input placeholder (optional)
// ─────────────────────────────────────────────────────────────────────────────

import { Search, SlidersHorizontal } from "lucide-react";

const SearchBarAndFilter = ({
  search,
  onSearch,
  dept,
  onDept,
  departments = [],
  placeholder = "Search faculty name or ID…",
}) => (
  <div className="flex gap-3 mb-6">
    {/* Search input */}
    <div className="relative flex-1">
      <Search
        size={15}
        className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
      />
    </div>

    {/* Department filter */}
    <div className="relative w-56">
      <SlidersHorizontal
        size={15}
        className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none"
      />
      <select
        value={dept}
        onChange={(e) => onDept(e.target.value)}
        className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition cursor-pointer appearance-none text-gray-700"
      >
        <option value="">All Departments</option>
        {departments.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
    </div>
  </div>
);

export default SearchBarAndFilter;