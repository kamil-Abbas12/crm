"use client";

import { useState } from "react";
import api from "../../lib/axios";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

const VERTICALS = ["Medicare", "Final Expense", "ACA / Health", "Auto Insurance", "Solar", "Mortgage Protection", "Life Insurance", "Annuity", "Other"];
const LEAD_SOURCES = ["Live Transfer", "Inbound Call", "Direct Mail", "Facebook", "Google", "Referral", "Cold Call", "TV Ad", "Door Knock", "Other"];
const LEAD_TYPES = ["Exclusive", "Shared", "Aged", "Real-Time", "T65"];
const STATUSES = ["new", "contacted", "qualified", "callback", "appointment_set", "applied", "converted", "not_interested", "do_not_call", "lost"];
const DISPOSITIONS = ["hot", "warm", "cold"];
const CALL_OUTCOMES = ["answered", "no_answer", "voicemail", "busy", "wrong_number", "callback_scheduled"];
const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

const VERTICAL_SUBTYPES: Record<string, string[]> = {
  "Medicare": ["Medicare Advantage (MAPD)", "Medicare Supplement (Medigap)", "Part D (PDP)", "Medicare + Dental/Vision", "T65 Prospect"],
  "Final Expense": ["Whole Life", "Graded Benefit", "Guaranteed Issue", "Term Life"],
  "ACA / Health": ["ACA Marketplace", "Short Term Health", "Group Health", "Dental/Vision"],
  "Auto Insurance": ["Personal Auto", "SR-22", "Commercial Auto", "Motorcycle"],
  "Solar": ["Residential Solar", "Commercial Solar", "Battery Storage"],
  "Life Insurance": ["Term", "Whole Life", "IUL", "GUL"],
  "Annuity": ["FIA", "MYGA", "SPIA"],
};

type Tab = "contact" | "lead" | "calls" | "vertical" | "notes";

export default function NewLeadPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("contact");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [callLog, setCallLog] = useState({ outcome: "answered", duration: "", note: "" });

  const [form, setForm] = useState({
    // Contact
    name: "", phone: "", phone2: "", email: "",
    dob: "", gender: "", state: "", zipCode: "", county: "", language: "English",
    // Lead
    vertical: "", subType: "", leadSource: "", leadType: "", status: "new",
    disposition: "", priority: "", agent: "",
    // Call tracking
    callCount: 0, callsAnswered: 0, callsNoAnswer: 0, callsVoicemail: 0,
    bestTimeToCall: "", nextCallDate: "", callLogs: [] as any[],
    // Medicare
    medicareNumber: "", medicarePartA: "", medicarePartB: "",
    currentPlan: "", tobaccoUser: false, t65Date: "",
    // Final Expense
    coverageAmount: "", currentCoverage: "", healthConditions: "",
    // ACA
    householdSize: "", annualIncome: "", currentlyInsured: false, enrollmentPeriod: "",
    // Auto
    vehicleYear: "", vehicleMake: "", vehicleModel: "", currentInsurer: "", currentPremium: "",
    // Solar
    homeOwner: false, monthlyElectricBill: "", roofAge: "", creditScore: "",
    // Notes
    notes: "",
  });

  const set = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

  const addCallLog = () => {
    if (!callLog.outcome) return;
    const log = {
      date: new Date().toISOString(),
      outcome: callLog.outcome,
      duration: callLog.duration ? parseInt(callLog.duration) : undefined,
      note: callLog.note,
    };
    const answered = callLog.outcome === "answered" ? 1 : 0;
    const noAnswer = callLog.outcome === "no_answer" ? 1 : 0;
    const voicemail = callLog.outcome === "voicemail" ? 1 : 0;
    setForm(f => ({
      ...f,
      callLogs: [...f.callLogs, log],
      callCount: f.callCount + 1,
      callsAnswered: f.callsAnswered + answered,
      callsNoAnswer: f.callsNoAnswer + noAnswer,
      callsVoicemail: f.callsVoicemail + voicemail,
    }));
    setCallLog({ outcome: "answered", duration: "", note: "" });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone) { setError("Name and phone are required"); return; }
    setLoading(true);
    setError("");
    try {
      await api.post("/api/leads", form);
      router.push("/leads");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to save lead");
    } finally {
      setLoading(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "contact", label: "Contact", icon: "👤" },
    { key: "lead", label: "Lead Info", icon: "🎯" },
    { key: "calls", label: "Call Log", icon: "📞" },
    { key: "vertical", label: "Vertical Details", icon: "📋" },
    { key: "notes", label: "Notes", icon: "📝" },
  ];

  const inputCls = "w-full bg-[#1a1a1a] border border-white/8 rounded-lg px-3 py-2.5 text-white placeholder-gray-700 text-sm outline-none focus:border-red-700/50 transition";
  const selectCls = "w-full bg-[#1a1a1a] border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-red-700/50 transition";
  const labelCls = "block text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-1.5";
  const gridCls = "grid grid-cols-1 sm:grid-cols-2 gap-4";

  const OUTCOME_ICONS: Record<string, string> = {
    answered: "✅", no_answer: "📵", voicemail: "📬",
    busy: "🔴", wrong_number: "❌", callback_scheduled: "📅",
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Add New Lead" />
        <main className="flex-1 overflow-y-auto p-5">
          <div className="max-w-3xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-black text-xl">New Lead</h2>
                <p className="text-gray-600 text-sm">Fill in as much detail as possible for better tracking</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => router.back()}
                  className="px-4 py-2 bg-white/5 border border-white/8 text-gray-400 text-sm font-semibold rounded-lg hover:bg-white/10 transition">
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={loading}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-sm rounded-lg transition shadow-lg shadow-red-900/30">
                  {loading ? "Saving…" : "Save Lead →"}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-950/60 border border-red-800/40 rounded-lg text-red-400 text-sm">⚠ {error}</div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 mb-5 bg-[#111] border border-white/5 rounded-xl p-1">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${
                    tab === t.key ? "bg-red-600/20 text-red-400 border border-red-800/30" : "text-gray-600 hover:text-gray-300"
                  }`}>
                  <span>{t.icon}</span>
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </div>

            <div className="bg-[#111] border border-white/5 rounded-xl p-5">

              {/* ── CONTACT TAB ── */}
              {tab === "contact" && (
                <div className="space-y-4">
                  <h3 className="text-white font-black text-sm border-b border-white/5 pb-3">Contact Information</h3>
                  <div className={gridCls}>
                    <div>
                      <label className={labelCls}>Full Name *</label>
                      <input className={inputCls} placeholder="John Smith" value={form.name} onChange={e => set("name", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Primary Phone *</label>
                      <input className={inputCls} placeholder="(555) 000-0000" value={form.phone} onChange={e => set("phone", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Secondary Phone</label>
                      <input className={inputCls} placeholder="(555) 000-0001" value={form.phone2} onChange={e => set("phone2", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Email</label>
                      <input type="email" className={inputCls} placeholder="john@email.com" value={form.email} onChange={e => set("email", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Date of Birth</label>
                      <input type="date" className={inputCls} value={form.dob} onChange={e => set("dob", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Gender</label>
                      <select className={selectCls} value={form.gender} onChange={e => set("gender", e.target.value)}>
                        <option value="">Select…</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>State</label>
                      <select className={selectCls} value={form.state} onChange={e => set("state", e.target.value)}>
                        <option value="">Select state…</option>
                        {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Zip Code</label>
                      <input className={inputCls} placeholder="75001" value={form.zipCode} onChange={e => set("zipCode", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>County</label>
                      <input className={inputCls} placeholder="Dallas County" value={form.county} onChange={e => set("county", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Language</label>
                      <select className={selectCls} value={form.language} onChange={e => set("language", e.target.value)}>
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ── LEAD INFO TAB ── */}
              {tab === "lead" && (
                <div className="space-y-4">
                  <h3 className="text-white font-black text-sm border-b border-white/5 pb-3">Lead Classification</h3>
                  <div className={gridCls}>
                    <div>
                      <label className={labelCls}>Vertical *</label>
                      <select className={selectCls} value={form.vertical} onChange={e => { set("vertical", e.target.value); set("subType", ""); }}>
                        <option value="">Select vertical…</option>
                        {VERTICALS.map(v => <option key={v}>{v}</option>)}
                      </select>
                    </div>
                    {form.vertical && VERTICAL_SUBTYPES[form.vertical] && (
                      <div>
                        <label className={labelCls}>Sub-Type</label>
                        <select className={selectCls} value={form.subType} onChange={e => set("subType", e.target.value)}>
                          <option value="">Select sub-type…</option>
                          {VERTICAL_SUBTYPES[form.vertical].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className={labelCls}>Lead Source</label>
                      <select className={selectCls} value={form.leadSource} onChange={e => set("leadSource", e.target.value)}>
                        <option value="">Select source…</option>
                        {LEAD_SOURCES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Lead Type</label>
                      <select className={selectCls} value={form.leadType} onChange={e => set("leadType", e.target.value)}>
                        <option value="">Select type…</option>
                        {LEAD_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Status</label>
                      <select className={selectCls} value={form.status} onChange={e => set("status", e.target.value)}>
                        {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Disposition</label>
                      <div className="flex gap-2">
                        {DISPOSITIONS.map(d => (
                          <button key={d} type="button" onClick={() => set("disposition", form.disposition === d ? "" : d)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition capitalize ${
                              form.disposition === d
                                ? d === "hot" ? "bg-red-900/40 border-red-600/60 text-red-400"
                                : d === "warm" ? "bg-orange-900/40 border-orange-600/60 text-orange-400"
                                : "bg-blue-900/40 border-blue-600/60 text-blue-400"
                                : "bg-white/5 border-white/8 text-gray-500"
                            }`}>
                            {d === "hot" ? "🔥 Hot" : d === "warm" ? "🌡 Warm" : "❄️ Cold"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Priority</label>
                      <div className="flex gap-2">
                        {["high", "medium", "low"].map(p => (
                          <button key={p} type="button" onClick={() => set("priority", form.priority === p ? "" : p)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition capitalize ${
                              form.priority === p
                                ? p === "high" ? "bg-red-900/40 border-red-600/60 text-red-400"
                                : p === "medium" ? "bg-yellow-900/40 border-yellow-600/60 text-yellow-400"
                                : "bg-gray-900/40 border-gray-600/60 text-gray-400"
                                : "bg-white/5 border-white/8 text-gray-500"
                            }`}>
                            {p === "high" ? "⚡ High" : p === "medium" ? "➖ Med" : "▽ Low"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Assigned Agent</label>
                      <input className={inputCls} placeholder="Agent name" value={form.agent} onChange={e => set("agent", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Best Time to Call</label>
                      <select className={selectCls} value={form.bestTimeToCall} onChange={e => set("bestTimeToCall", e.target.value)}>
                        <option value="">Any time</option>
                        <option value="morning">Morning (8am–12pm)</option>
                        <option value="afternoon">Afternoon (12pm–5pm)</option>
                        <option value="evening">Evening (5pm–8pm)</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Schedule Callback</label>
                      <input type="datetime-local" className={inputCls} value={form.nextCallDate} onChange={e => set("nextCallDate", e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── CALL LOG TAB ── */}
              {tab === "calls" && (
                <div className="space-y-5">
                  <h3 className="text-white font-black text-sm border-b border-white/5 pb-3">Call Tracking</h3>

                  {/* Summary */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Total Calls", value: form.callCount, color: "text-white" },
                      { label: "Answered", value: form.callsAnswered, color: "text-green-400" },
                      { label: "No Answer", value: form.callsNoAnswer, color: "text-yellow-400" },
                      { label: "Voicemail", value: form.callsVoicemail, color: "text-blue-400" },
                    ].map(s => (
                      <div key={s.label} className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
                        <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                        <p className="text-gray-600 text-[10px] mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Log a call */}
                  <div className="bg-white/3 border border-white/8 rounded-xl p-4">
                    <p className="text-white font-bold text-sm mb-3">Log a Call</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className={labelCls}>Outcome</label>
                        <select className={selectCls} value={callLog.outcome} onChange={e => setCallLog(c => ({ ...c, outcome: e.target.value }))}>
                          {CALL_OUTCOMES.map(o => <option key={o} value={o}>{OUTCOME_ICONS[o]} {o.replace(/_/g, " ")}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Duration (seconds)</label>
                        <input type="number" className={inputCls} placeholder="e.g. 180" value={callLog.duration}
                          onChange={e => setCallLog(c => ({ ...c, duration: e.target.value }))} />
                      </div>
                      <div>
                        <label className={labelCls}>Note</label>
                        <input className={inputCls} placeholder="Call notes…" value={callLog.note}
                          onChange={e => setCallLog(c => ({ ...c, note: e.target.value }))} />
                      </div>
                    </div>
                    <button onClick={addCallLog}
                      className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition">
                      + Add Call
                    </button>
                  </div>

                  {/* Call history */}
                  {form.callLogs.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Call History</p>
                      {form.callLogs.map((log, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white/3 border border-white/5 rounded-lg">
                          <span className="text-lg">{OUTCOME_ICONS[log.outcome]}</span>
                          <div className="flex-1">
                            <p className="text-white text-sm font-semibold capitalize">{log.outcome.replace(/_/g, " ")}</p>
                            {log.note && <p className="text-gray-500 text-xs">{log.note}</p>}
                          </div>
                          {log.duration && (
                            <span className="text-gray-600 text-xs">{Math.floor(log.duration / 60)}m {log.duration % 60}s</span>
                          )}
                          <span className="text-gray-700 text-xs">{new Date(log.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── VERTICAL DETAILS TAB ── */}
              {tab === "vertical" && (
                <div className="space-y-4">
                  <h3 className="text-white font-black text-sm border-b border-white/5 pb-3">
                    {form.vertical || "Vertical"} Details
                  </h3>

                  {(!form.vertical) && (
                    <p className="text-gray-600 text-sm text-center py-6">Select a vertical in the Lead Info tab first.</p>
                  )}

                  {/* Medicare */}
                  {form.vertical === "Medicare" && (
                    <div className={gridCls}>
                      <div><label className={labelCls}>Medicare Beneficiary ID</label>
                        <input className={inputCls} placeholder="1EG4-TE5-MK72" value={form.medicareNumber} onChange={e => set("medicareNumber", e.target.value)} /></div>
                      <div><label className={labelCls}>Part A Effective Date</label>
                        <input type="date" className={inputCls} value={form.medicarePartA} onChange={e => set("medicarePartA", e.target.value)} /></div>
                      <div><label className={labelCls}>Part B Effective Date</label>
                        <input type="date" className={inputCls} value={form.medicarePartB} onChange={e => set("medicarePartB", e.target.value)} /></div>
                      <div><label className={labelCls}>Current Plan/Carrier</label>
                        <input className={inputCls} placeholder="UnitedHealthcare, Humana…" value={form.currentPlan} onChange={e => set("currentPlan", e.target.value)} /></div>
                      <div><label className={labelCls}>Turns 65 Date (T65)</label>
                        <input type="date" className={inputCls} value={form.t65Date} onChange={e => set("t65Date", e.target.value)} /></div>
                      <div className="flex items-center gap-3 pt-4">
                        <input type="checkbox" id="tobacco" checked={form.tobaccoUser} onChange={e => set("tobaccoUser", e.target.checked)} className="accent-red-500 w-4 h-4" />
                        <label htmlFor="tobacco" className="text-gray-400 text-sm">Tobacco user</label>
                      </div>
                    </div>
                  )}

                  {/* Final Expense */}
                  {form.vertical === "Final Expense" && (
                    <div className={gridCls}>
                      <div><label className={labelCls}>Desired Coverage Amount ($)</label>
                        <input type="number" className={inputCls} placeholder="10000" value={form.coverageAmount} onChange={e => set("coverageAmount", e.target.value)} /></div>
                      <div><label className={labelCls}>Current Coverage/Policy</label>
                        <input className={inputCls} placeholder="Existing policy?" value={form.currentCoverage} onChange={e => set("currentCoverage", e.target.value)} /></div>
                      <div className="sm:col-span-2"><label className={labelCls}>Health Conditions (underwriting notes)</label>
                        <input className={inputCls} placeholder="Diabetes, COPD, etc." value={form.healthConditions} onChange={e => set("healthConditions", e.target.value)} /></div>
                    </div>
                  )}

                  {/* ACA */}
                  {form.vertical === "ACA / Health" && (
                    <div className={gridCls}>
                      <div><label className={labelCls}>Household Size</label>
                        <input type="number" className={inputCls} placeholder="3" value={form.householdSize} onChange={e => set("householdSize", e.target.value)} /></div>
                      <div><label className={labelCls}>Annual Household Income ($)</label>
                        <input type="number" className={inputCls} placeholder="45000" value={form.annualIncome} onChange={e => set("annualIncome", e.target.value)} /></div>
                      <div><label className={labelCls}>Enrollment Period</label>
                        <select className={selectCls} value={form.enrollmentPeriod} onChange={e => set("enrollmentPeriod", e.target.value)}>
                          <option value="">Select…</option>
                          <option>Open Enrollment (OEP)</option>
                          <option>Special Enrollment (SEP)</option>
                          <option>Annual Enrollment (AEP)</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-3 pt-4">
                        <input type="checkbox" id="insured" checked={form.currentlyInsured} onChange={e => set("currentlyInsured", e.target.checked)} className="accent-red-500 w-4 h-4" />
                        <label htmlFor="insured" className="text-gray-400 text-sm">Currently insured</label>
                      </div>
                    </div>
                  )}

                  {/* Auto */}
                  {form.vertical === "Auto Insurance" && (
                    <div className={gridCls}>
                      <div><label className={labelCls}>Vehicle Year</label>
                        <input type="number" className={inputCls} placeholder="2020" value={form.vehicleYear} onChange={e => set("vehicleYear", e.target.value)} /></div>
                      <div><label className={labelCls}>Vehicle Make</label>
                        <input className={inputCls} placeholder="Toyota" value={form.vehicleMake} onChange={e => set("vehicleMake", e.target.value)} /></div>
                      <div><label className={labelCls}>Vehicle Model</label>
                        <input className={inputCls} placeholder="Camry" value={form.vehicleModel} onChange={e => set("vehicleModel", e.target.value)} /></div>
                      <div><label className={labelCls}>Current Insurer</label>
                        <input className={inputCls} placeholder="State Farm, Geico…" value={form.currentInsurer} onChange={e => set("currentInsurer", e.target.value)} /></div>
                      <div><label className={labelCls}>Current Monthly Premium ($)</label>
                        <input type="number" className={inputCls} placeholder="150" value={form.currentPremium} onChange={e => set("currentPremium", e.target.value)} /></div>
                    </div>
                  )}

                  {/* Solar */}
                  {form.vertical === "Solar" && (
                    <div className={gridCls}>
                      <div className="flex items-center gap-3 pt-2">
                        <input type="checkbox" id="homeowner" checked={form.homeOwner} onChange={e => set("homeOwner", e.target.checked)} className="accent-red-500 w-4 h-4" />
                        <label htmlFor="homeowner" className="text-gray-400 text-sm">Home owner</label>
                      </div>
                      <div><label className={labelCls}>Monthly Electric Bill ($)</label>
                        <input type="number" className={inputCls} placeholder="200" value={form.monthlyElectricBill} onChange={e => set("monthlyElectricBill", e.target.value)} /></div>
                      <div><label className={labelCls}>Roof Age (years)</label>
                        <input type="number" className={inputCls} placeholder="5" value={form.roofAge} onChange={e => set("roofAge", e.target.value)} /></div>
                      <div><label className={labelCls}>Credit Score Range</label>
                        <select className={selectCls} value={form.creditScore} onChange={e => set("creditScore", e.target.value)}>
                          <option value="">Select…</option>
                          <option value="excellent">Excellent (740+)</option>
                          <option value="good">Good (670–739)</option>
                          <option value="fair">Fair (580–669)</option>
                          <option value="poor">Poor (below 580)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── NOTES TAB ── */}
              {tab === "notes" && (
                <div className="space-y-4">
                  <h3 className="text-white font-black text-sm border-b border-white/5 pb-3">Notes & Additional Info</h3>
                  <textarea
                    rows={10}
                    placeholder="Enter any additional notes about this lead — conversation history, objections, follow-up details, plan preferences, etc."
                    value={form.notes}
                    onChange={e => set("notes", e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/8 rounded-lg px-4 py-3 text-white placeholder-gray-700 text-sm outline-none focus:border-red-700/50 transition resize-none"
                  />
                </div>
              )}
            </div>

            {/* Bottom save */}
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => router.back()}
                className="px-4 py-2.5 bg-white/5 border border-white/8 text-gray-400 text-sm font-semibold rounded-lg hover:bg-white/10 transition">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-sm rounded-lg transition shadow-lg shadow-red-900/30">
                {loading ? "Saving…" : "Save Lead →"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}