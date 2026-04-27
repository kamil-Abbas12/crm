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
    <div className="bg-[#111111] border border-white/5 rounded-xl p-4 sm:p-5 w-full">
      <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-5 gap-2">
        <div className="min-w-0">
          <h3 className="text-white font-black text-sm sm:text-base tracking-tight truncate">
            Leads by Vertical
          </h3>
          <p className="text-gray-600 text-xs mt-0.5">This month's distribution</p>
        </div>
        <span className="text-xs text-red-400 font-semibold bg-red-950/50 border border-red-900/40 px-2 sm:px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
          3,847 total
        </span>
      </div>

      <div className="space-y-3">
        {verticals.map((v) => (
          <div key={v.name}>
            <div className="flex items-center justify-between mb-1 gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span
                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: v.color }}
                />
                <span className="text-gray-300 text-xs sm:text-sm font-medium truncate">{v.name}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className="text-gray-500 text-xs hidden xs:inline sm:inline">{v.count.toLocaleString()}</span>
                <span className="text-white text-xs sm:text-sm font-bold w-7 sm:w-8 text-right">
                  {v.pct}%
                </span>
              </div>
            </div>
            <div className="h-1.5 sm:h-2 bg-white/5 rounded-full overflow-hidden">
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
      <div className="mt-3 sm:mt-4 h-2.5 sm:h-3 rounded-full overflow-hidden flex">
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