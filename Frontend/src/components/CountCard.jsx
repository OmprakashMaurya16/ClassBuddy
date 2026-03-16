// ─────────────────────────────────────────────────────────────────────────────
// CountCard.jsx
// Reusable stat card used in AdminDashboard institute overview strip.
//
// Props:
//   label   – string  e.g. "INFT Department"
//   count   – number | null  (null → shows skeleton)
//   icon    – ReactNode
//   iconBg  – tailwind bg+text classes e.g. "bg-indigo-50 text-indigo-500"
// ─────────────────────────────────────────────────────────────────────────────

const Skeleton = () => (
  <div className="h-8 w-16 rounded-md bg-gray-200 animate-pulse" />
);

const CountCard = ({ label, count, icon, iconBg = "bg-blue-50 text-blue-500" }) => (
  <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">

    {/* Value */}
    {count == null ? (
      <Skeleton />
    ) : (
      <span className="text-3xl font-bold text-gray-800 leading-none tracking-tight">
        {count.toLocaleString()}
      </span>
    )}

    {/* Label */}
    <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 leading-tight">
      {label}
    </span>
  </div>
);

export default CountCard;