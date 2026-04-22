"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-950 text-blue-400 border-blue-900/50",
  contacted: "bg-yellow-950 text-yellow-400 border-yellow-900/50",
  qualified: "bg-purple-950 text-purple-400 border-purple-900/50",
  converted: "bg-green-950 text-green-400 border-green-900/50",
  lost: "bg-red-950 text-red-400 border-red-900/50",
};

const MOCK_LEADS = [
  { _id: "1", name: "James Carter", phone: "555-0101", email: "james@email.com", vertical: "Medicare", status: "new", createdAt: new Date().toISOString() },
  { _id: "2", name: "Maria Santos", phone: "555-0102", email: "maria@email.com", vertical: "Final Expense", status: "contacted", createdAt: new Date().toISOString() },
  { _id: "3", name: "Robert Kim", phone: "555-0103", email: "robert@email.com", vertical: "ACA / Health", status: "qualified", createdAt: new Date().toISOString() },
  { _id: "4", name: "Diane Foster", phone: "555-0104", email: "diane@email.com", vertical: "Auto Insurance", status: "converted", createdAt: new Date().toISOString() },
  { _id: "5", name: "Carlos Vega", phone: "555-0105", email: "carlos@email.com", vertical: "Solar", status: "new", createdAt: new Date().toISOString() },
];

export default function RecentLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/leads")
      .then((res) => {
        setLeads(res.data?.length ? res.data.slice(0, 5) : MOCK_LEADS);
      })
      .catch(() => setLeads(MOCK_LEADS))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-black text-base tracking-tight">
            Recent Leads
          </h3>
          <p className="text-gray-600 text-xs mt-0.5">Latest incoming leads</p>
        </div>
        <Link
          href="/leads"
          className="text-red-400 hover:text-red-300 text-xs font-semibold transition-colors"
        >
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-gray-600 font-semibold text-xs uppercase tracking-wider pb-2.5">
                  Name
                </th>
                <th className="text-left text-gray-600 font-semibold text-xs uppercase tracking-wider pb-2.5 hidden sm:table-cell">
                  Phone
                </th>
                <th className="text-left text-gray-600 font-semibold text-xs uppercase tracking-wider pb-2.5 hidden md:table-cell">
                  Vertical
                </th>
                <th className="text-left text-gray-600 font-semibold text-xs uppercase tracking-wider pb-2.5">
                  Status
                </th>
                <th className="pb-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.map((lead) => (
                <tr key={lead._id} className="group hover:bg-white/3 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-800 to-red-950 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {lead.name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-semibold leading-tight">{lead.name}</p>
                        <p className="text-gray-600 text-xs">{lead.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-gray-400 hidden sm:table-cell">
                    {lead.phone}
                  </td>
                  <td className="py-3 hidden md:table-cell">
                    <span className="text-gray-400 text-xs">{lead.vertical || "—"}</span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                        STATUS_STYLES[lead.status] || STATUS_STYLES["new"]
                      }`}
                    >
                      {lead.status || "new"}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/leads/${lead._id}`}
                      className="text-gray-700 group-hover:text-red-400 transition-colors text-xs font-medium"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}