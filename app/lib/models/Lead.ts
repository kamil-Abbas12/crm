import mongoose from "mongoose";

const CallLogSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  duration: Number, // seconds
  outcome: {
    type: String,
    enum: ["answered", "no_answer", "voicemail", "busy", "wrong_number", "callback_scheduled"],
  },
  note: String,
  agentName: String,
});

const LeadSchema = new mongoose.Schema({
  // ── Core Contact ──────────────────────────────────────
  name: { type: String, required: true },
  phone: { type: String, required: true },
  phone2: String, // secondary phone
  email: String,
  dob: Date,           // Date of Birth — critical for Medicare (T65 workflow)
  age: Number,
  gender: { type: String, enum: ["male", "female", "other", ""] },
  state: String,       // state matters for plan availability
  zipCode: String,
  county: String,      // county matters for Medicare Advantage plans
  language: { type: String, default: "English" }, // bilingual support

  // ── Lead Classification ───────────────────────────────
  vertical: {
    type: String,
    enum: ["Medicare", "Final Expense", "ACA / Health", "Auto Insurance", "Solar", "Mortgage Protection", "Life Insurance", "Annuity", "Other"],
  },
  subType: String, // e.g. "Medicare Advantage", "Medicare Supplement", "MAPD", "PDP"
  leadSource: {
    type: String,
    enum: ["Live Transfer", "Inbound Call", "Direct Mail", "Facebook", "Google", "Referral", "Cold Call", "TV Ad", "Door Knock", "Other"],
  },
  leadType: {
    type: String,
    enum: ["Exclusive", "Shared", "Aged", "Real-Time", "T65"],
  },

  // ── Status & Disposition ──────────────────────────────
  status: {
    type: String,
    default: "new",
    enum: ["new", "contacted", "qualified", "callback", "appointment_set", "applied", "converted", "not_interested", "do_not_call", "lost"],
  },
  disposition: {
    type: String,
    enum: ["hot", "warm", "cold", ""],
    default: "",
  },
  priority: { type: String, enum: ["high", "medium", "low", ""], default: "" },

  // ── Call Tracking ─────────────────────────────────────
  callCount: { type: Number, default: 0 },
  callsAnswered: { type: Number, default: 0 },
  callsNoAnswer: { type: Number, default: 0 },
  callsVoicemail: { type: Number, default: 0 },
  lastCallDate: Date,
  nextCallDate: Date,   // scheduled callback
  bestTimeToCall: String, // "morning", "afternoon", "evening"
  callLogs: [CallLogSchema],

  // ── Medicare Specific ─────────────────────────────────
  medicareNumber: String,       // Medicare Beneficiary ID
  medicarePartA: Date,          // Part A effective date
  medicarePartB: Date,          // Part B effective date
  currentPlan: String,          // current carrier/plan
  planYear: String,
  tobaccoUser: Boolean,
  t65Date: Date,                // turns 65 date — for T65 pipeline

  // ── Final Expense Specific ────────────────────────────
  coverageAmount: Number,       // desired coverage $5k–$25k
  currentCoverage: String,      // existing policy?
  healthConditions: String,     // simplified underwriting notes

  // ── ACA / Health Specific ─────────────────────────────
  householdSize: Number,
  annualIncome: Number,
  currentlyInsured: Boolean,
  enrollmentPeriod: String,     // AEP, OEP, SEP

  // ── Auto Insurance Specific ───────────────────────────
  vehicleYear: Number,
  vehicleMake: String,
  vehicleModel: String,
  currentInsurer: String,
  currentPremium: Number,

  // ── Solar Specific ────────────────────────────────────
  homeOwner: Boolean,
  monthlyElectricBill: Number,
  roofAge: Number,
  creditScore: String,          // "excellent", "good", "fair", "poor"

  // ── Assignment & Tracking ─────────────────────────────
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  agent: String,
  transferredFrom: String,      // which agent/source transferred this lead
  campaignId: String,           // which marketing campaign

  // ── Notes ─────────────────────────────────────────────
  notes: String,

  // ── Timestamps ────────────────────────────────────────
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

LeadSchema.pre("save", async function () {
  this.updatedAt = new Date();
});

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);