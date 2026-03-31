import { useState, useRef } from "react";

const TimelineChart = ({ data = [] }) => {
  const [hoverData, setHoverData] = useState(null);
  const svgRef = useRef(null);

  if (!data || data.length === 0) {
    return <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />;
  }

  const W = 560, H = 160;
  const PAD = { t: 30, b: 30, l: 40, r: 20 };
  const cw = W - PAD.l - PAD.r;
  const ch = H - PAD.t - PAD.b;

  const scores = data.map((d) => d.score);
  const dept = data.map((d) => d.deptAvg);
  const min = Math.max(0, Math.min(...scores, ...dept) - 0.5);
  const max = Math.min(5, Math.max(...scores, ...dept) + 0.5);

  const getX = (i) => PAD.l + (data.length === 1 ? cw / 2 : (i / (data.length - 1)) * cw);
  const getY = (v) => PAD.t + ch - ((v - min) / (max - min)) * ch;

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    
    // Find closest index based on X coordinate
    const index = data.reduce((prev, _, curr) => 
      Math.abs(getX(curr) - x) < Math.abs(getX(prev) - x) ? curr : prev
    , 0);

    setHoverData({
      index,
      x: ((getX(index) / W) * 100) + "%", // Percentage for stable CSS positioning
      y: ((getY(scores[index]) / H) * 100) + "%",
      val: data[index]
    });
  };

  const linePoints = (arr) => arr.map((v, i) => `${getX(i)},${getY(v)}`).join(" ");

  return (
    <div className="relative w-full group select-none">
      <svg 
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`} 
        className="w-full h-auto overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverData(null)}
      >
        {/* Helper Grid Lines */}
        {[0, 1, 2].map(i => (
          <line key={i} x1={PAD.l} x2={W-PAD.r} y1={getY(min + (max-min)*(i/2))} y2={getY(min + (max-min)*(i/2))} className="stroke-gray-100" strokeWidth="1" />
        ))}

        {/* Dept Line */}
        <polyline
          points={linePoints(dept)}
          fill="none"
          className="stroke-gray-300 stroke-1"
          strokeDasharray="4 4"
        />

        {/* User Line */}
        <polyline
          points={linePoints(scores)}
          fill="none"
          className="stroke-blue-500 stroke-3 transition-all duration-300"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Active Vertical Indicator */}
        {hoverData && (
          <line 
            x1={getX(hoverData.index)} x2={getX(hoverData.index)} 
            y1={PAD.t} y2={H - PAD.b} 
            className="stroke-blue-200 stroke-1" 
          />
        )}

        {/* Interaction Points */}
        {scores.map((v, i) => (
          <circle
            key={i}
            cx={getX(i)}
            cy={getY(v)}
            r={hoverData?.index === i ? 6 : 4}
            className={`transition-all duration-200 ${hoverData?.index === i ? 'fill-blue-600' : 'fill-white'} stroke-blue-600 stroke-2`}
          />
        ))}

        {/* Labels */}
        {data.map((d, i) => (
          <text key={i} x={getX(i)} y={H - 10} textAnchor="middle" className="text-[10px] fill-gray-400 font-medium">
            {d.label}
          </text>
        ))}
      </svg>

      {/* Tooltip - Now uses % for perfectly stable positioning */}
      {hoverData && (
        <div
          className="absolute z-10 pointer-events-none bg-slate-100 shadow-xl px-3 py-2 rounded-lg text-xs transition-all duration-150 ease-out"
          style={{
            left: hoverData.x,
            top: hoverData.y,
            transform: "translate(-50%, calc(-100% - 15px))",
          }}
        >
          <div className="font-bold border-b border-slate-200 pb-1 mb-1">{hoverData.val.label}</div>
          <div className="flex justify-between gap-4">
            <span className="text-blue-500 font-semibold">You: {hoverData.val.score}</span>
            <span className="text-slate-500 font-semibold">Dept: {hoverData.val.deptAvg}</span>
          </div>
          {/* Tooltip Arrow */}
          <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-blue-200 rotate-45" />
        </div>
      )}
    </div>
  );
};

export default TimelineChart;
