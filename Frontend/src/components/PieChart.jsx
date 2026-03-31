const COLORS = {
  positive: "#22c55e",
  neutral: "#facc15",
  negative: "#ef4444",
};

const PieChart = ({ data }) => {
  const positive = data?.positive ?? 0;
  const neutral = data?.neutral ?? 0;
  const negative = data?.negative ?? 0;

  const total = positive + neutral + negative;

  // Prevent division by zero
  if (total === 0) {
    return (
      <div className="text-gray-400 text-sm text-center">No data available</div>
    );
  }

  const size = 120;
  const r = 42;
  const stroke = 18;
  const circumference = 2 * Math.PI * r;

  const segments = [
    { value: positive, color: COLORS.positive },
    { value: neutral, color: COLORS.neutral },
    { value: negative, color: COLORS.negative },
  ];

  let offset = 0;

  return (
    <svg viewBox="0 0 120 120" className="w-full max-w-40">
      {/* Background */}
      <circle
        cx="60"
        cy="60"
        r={r}
        stroke="#f3f4f6"
        strokeWidth={stroke}
        fill="none"
      />

      {/* Segments */}
      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circumference;

        const circle = (
          <circle
            key={i}
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${circumference}`}
            strokeDashoffset={-offset}
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "center",
              transition: "all 0.6s ease",
            }}
          />
        );

        offset += dash;
        return circle;
      })}

      {/* Center Text */}
      <text
        x="60"
        y="55"
        textAnchor="middle"
        className="text-sm font-bold fill-gray-800"
      >
        {positive}%
      </text>
      <text
        x="60"
        y="70"
        textAnchor="middle"
        className="text-[10px] fill-gray-400"
      >
        Positive
      </text>
    </svg>
  );
};

export default PieChart;
