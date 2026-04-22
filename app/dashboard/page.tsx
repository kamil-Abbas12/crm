"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatsCard from "../components/StatsCard";
import RecentLeads from "../components/RecentLeads";
import LeadsByVertical from "../components/LeadsByVertical";
import ActivityFeed from "../components/ActivityFeed";

export default function Dashboard() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const stats = [
    {
      label: "Total Leads",
      value: "3,847",
      change: "+12.4%",
      up: true,
      icon: "🎯",
      sub: "vs last month",
    },
    {
      label: "Live Transfers",
      value: "1,293",
      change: "+8.1%",
      up: true,
      icon: "📞",
      sub: "vs last month",
    },
    {
      label: "Conversion Rate",
      value: "33.6%",
      change: "+2.3%",
      up: true,
      icon: "📈",
      sub: "vs last month",
    },
    {
      label: "Closed Deals",
      value: "$248K",
      change: "-1.2%",
      up: false,
      icon: "💰",
      sub: "revenue this month",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Dashboard" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Welcome Banner */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#1a0000] via-[#2a0505] to-[#1a0000] border border-red-900/40 p-6">
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ff0000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm font-semibold tracking-widest uppercase mb-1">
                  Welcome Back
                </p>
                <h1 className="text-white text-3xl font-black tracking-tight">
                  TopDog CRM <span className="text-red-500">Command Center</span>
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Medicare · Final Expense · ACA · Auto · Solar
                </p>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-red-400 text-xs tracking-widest uppercase">
                  {time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
                <p className="text-white text-4xl font-black tabular-nums">
                  {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <StatsCard key={i} {...s} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <LeadsByVertical />
              <RecentLeads />
            </div>
            <div>
              <ActivityFeed />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}