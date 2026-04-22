"use client";

interface StatsCardProps {
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: string;
  sub: string;
}

export default function StatsCard({ label, value, change, up, icon, sub }: StatsCardProps) {
  return (
    <div className="group relative rounded-xl bg-[#111111] border border-white/5 p-5 hover:border-red-900/60 transition-all duration-300 overflow-hidden">
      {/* Glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-red-950/30 to-transparent pointer-events-none" />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <span className="text-2xl">{icon}</span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              up
                ? "bg-green-950 text-green-400 border border-green-900/50"
                : "bg-red-950 text-red-400 border border-red-900/50"
            }`}
          >
            {change}
          </span>
        </div>

        <p className="text-gray-500 text-xs font-semibold tracking-wider uppercase mb-1">
          {label}
        </p>
        <p className="text-white text-3xl font-black tracking-tight">{value}</p>
        <p className="text-gray-600 text-xs mt-1">{sub}</p>

        {/* Bottom accent bar */}
        <div className={`absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 ${up ? "bg-red-600" : "bg-orange-600"}`} />
      </div>
    </div>
  );
}