"use client";

const verticals = [
  { name: "Medicare", count: 1240, pct: 32, color: "#ef4444" },
  { name: "Final Expense", count: 980, pct: 25, color: "#f97316" },
  { name: "ACA / Health", count: 740, pct: 19, color: "#eab308" },
  { name: "Auto Insurance", count: 590, pct: 15, color: "#22c55e" },
  { name: "Solar", count: 297, pct: 9, color: "#3b82f6" },
];

export default function LeadsByVertical() {
  return (
    <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-black text-base tracking-tight">
            Leads by Vertical
          </h3>
          <p className="text-gray-600 text-xs mt-0.5">This month's distribution</p>
        </div>
        <span className="text-xs text-red-400 font-semibold bg-red-950/50 border border-red-900/40 px-2.5 py-1 rounded-full">
          3,847 total
        </span>
      </div>

      <div className="space-y-3">
        {verticals.map((v) => (
          <div key={v.name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: v.color }}
                />
                <span className="text-gray-300 text-sm font-medium">{v.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-xs">{v.count.toLocaleString()}</span>
                <span className="text-white text-sm font-bold w-8 text-right">
                  {v.pct}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${v.pct}%`,
                  backgroundColor: v.color,
                  boxShadow: `0 0 8px ${v.color}80`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Combined bar */}
      <div className="mt-4 h-3 rounded-full overflow-hidden flex">
        {verticals.map((v) => (
          <div
            key={v.name}
            style={{ width: `${v.pct}%`, backgroundColor: v.color }}
            className="transition-all duration-700"
            title={`${v.name}: ${v.pct}%`}
          />
        ))}
      </div>
    </div>
  );
}