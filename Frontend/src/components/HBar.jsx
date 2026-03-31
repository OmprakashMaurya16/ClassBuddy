const HBar = ({ label, score = 0, max = 5 }) => {
  const pct = (score / max) * 100;

  return (
    <div className="mb-3 group">
      <div className="flex justify-between text-sm mb-1 cursor-pointer">
        <span>{label}</span>
        <span className="font-semibold">
          {score}/{max}
        </span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-700 group-hover:bg-blue-600"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition">
        {pct.toFixed(1)}% performance
      </div>
    </div>
  );
};

export default HBar;
