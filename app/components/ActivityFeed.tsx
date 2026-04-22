"use client";

const activities = [
  {
    type: "new_lead",
    text: "New Medicare lead from James Carter",
    time: "2m ago",
    icon: "🎯",
    color: "bg-red-600",
  },
  {
    type: "transfer",
    text: "Live transfer completed — Final Expense",
    time: "8m ago",
    icon: "📞",
    color: "bg-orange-600",
  },
  {
    type: "converted",
    text: "Maria Santos marked as Converted",
    time: "23m ago",
    icon: "✅",
    color: "bg-green-700",
  },
  {
    type: "new_lead",
    text: "New ACA lead — Carlos Vega",
    time: "41m ago",
    icon: "🎯",
    color: "bg-red-600",
  },
  {
    type: "note",
    text: "Agent Sarah added note on Robert Kim",
    time: "1h ago",
    icon: "📝",
    color: "bg-blue-700",
  },
  {
    type: "transfer",
    text: "Inbound call — Auto Insurance vertical",
    time: "1h ago",
    icon: "📞",
    color: "bg-orange-600",
  },
  {
    type: "new_lead",
    text: "Solar lead from Diego Morales",
    time: "2h ago",
    icon: "🎯",
    color: "bg-red-600",
  },
];

const quickStats = [
  { label: "Today's Leads", value: "47", icon: "🎯" },
  { label: "Calls Today", value: "128", icon: "📞" },
  { label: "Active Agents", value: "12", icon: "👥" },
];

export default function ActivityFeed() {
  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
        <h3 className="text-white font-black text-base tracking-tight mb-4">
          Today at a Glance
        </h3>
        <div className="space-y-3">
          {quickStats.map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between p-3 bg-white/3 rounded-lg border border-white/5"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{s.icon}</span>
                <span className="text-gray-400 text-sm">{s.label}</span>
              </div>
              <span className="text-white font-black text-lg">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-black text-base tracking-tight">
            Live Activity
          </h3>
          <span className="flex items-center gap-1.5 text-xs text-green-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live
          </span>
        </div>

        <div className="space-y-3">
          {activities.map((a, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className={`w-7 h-7 rounded-full ${a.color} flex items-center justify-center flex-shrink-0 mt-0.5 text-sm`}
              >
                {a.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-300 text-sm leading-snug">{a.text}</p>
                <p className="text-gray-600 text-xs mt-0.5">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}