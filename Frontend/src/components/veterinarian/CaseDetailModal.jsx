import React from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  MapPin,
  Calendar,
  AlertTriangle,
  Activity,
  Skull,
  Stethoscope,
  ShieldAlert,
  BadgeCheck,
  FlaskConical,
  TestTube,
  Pill,
  FileText,
  Clock,
  ArrowRight,
  User,
} from 'lucide-react';
import { caseService } from '../../services/caseService';
import { useAuth } from '../../context/AuthContext';

// ── helpers ──────────────────────────────────────────────────────────────────

const RISK_STYLES = {
  CRITICAL: {
    badge: 'bg-red-600 text-white font-black',
    bar: 'bg-red-500',
    ring: 'ring-red-200',
    text: 'text-red-700',
    light: 'bg-red-50',
  },
  HIGH: {
    badge: 'bg-amber-500 text-white font-bold',
    bar: 'bg-amber-500',
    ring: 'ring-amber-200',
    text: 'text-amber-700',
    light: 'bg-amber-50',
  },
  MODERATE: {
    badge: 'bg-yellow-400 text-yellow-900 font-semibold',
    bar: 'bg-yellow-400',
    ring: 'ring-yellow-200',
    text: 'text-yellow-700',
    light: 'bg-yellow-50',
  },
  LOW: {
    badge: 'bg-emerald-500 text-white font-medium',
    bar: 'bg-emerald-500',
    ring: 'ring-emerald-200',
    text: 'text-emerald-700',
    light: 'bg-emerald-50',
  },
  PENDING: {
    badge: 'bg-slate-500 text-white',
    bar: 'bg-slate-400',
    ring: 'ring-slate-200',
    text: 'text-slate-700',
    light: 'bg-slate-50',
  },
};

const STATUS_LABELS = {
  REPORTED: { label: 'Reported', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  AI_ASSESSED: { label: 'AI Assessed', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  INVESTIGATING: { label: 'Investigating', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  UNDER_INVESTIGATION: { label: 'Under Investigation', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  SUSPECTED: { label: 'Suspected', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  CONFIRMED: { label: 'Confirmed', color: 'bg-red-100 text-red-800 border-red-200' },
  RESPONSE: { label: 'Response Deployed', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  MONITORING: { label: 'Monitoring', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  RESOLVED: { label: 'Resolved', color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const fmt = (iso) => {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// ── component ─────────────────────────────────────────────────────────────────

export const CaseDetailModal = ({ case: c, onClose, onRefresh }) => {
  const { user } = useAuth();
  if (!c) return null;

  const caseId = c.id || c._id || 'N/A';
  const riskKey = (c.riskLevel || 'Pending').toUpperCase();
  const statusKey = (c.status || 'Reported').toUpperCase().replace(/\s+/g, '_');
  const risk = RISK_STYLES[riskKey] ?? RISK_STYLES.PENDING;
  const statusMeta = STATUS_LABELS[statusKey] ?? { label: c.status || 'Reported', color: 'bg-slate-100 text-slate-700 border-slate-200' };
  const lat = c.lat !== null && c.lat !== undefined ? c.lat : c.latitude;
  const lng = c.lng !== null && c.lng !== undefined ? c.lng : c.longitude;
  const symptomsArr = Array.isArray(c.symptoms) ? c.symptoms : (c.symptoms ? [c.symptoms] : []);

  const [currentStatus, setCurrentStatus] = React.useState(c.status || 'UNDER_INVESTIGATION');
  const [treatmentNotes, setTreatmentNotes] = React.useState(c.treatmentNotes || '');
  const [labReferral, setLabReferral] = React.useState(Boolean(c.labReferral));
  const [labNotes, setLabNotes] = React.useState(c.labNotes || '');
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState('');

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      const updated = await caseService.updateCase(caseId, {
        status: currentStatus,
        treatmentNotes,
        labReferral,
        labNotes,
      });
      setMsg('Clinical investigation updated successfully!');
      if (onRefresh) onRefresh(updated);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const aiData = c.aiAnalysis || {};
  const possibleConditions = Array.isArray(aiData.possibleConditions) ? aiData.possibleConditions : [];
  const recommendations = Array.isArray(aiData.recommendations) ? aiData.recommendations : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold bg-white/15 text-emerald-300 px-2.5 py-1 rounded-lg">
              {caseId}
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${risk.badge}`}>
              {c.riskLevel || 'Pending'} ({c.riskScore ?? 0}/100)
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Assignment (Informational Only) ── */}
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
            <BadgeCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Assigned To: {user?.name || c.assignedVet || 'Field Veterinary Officer'}</span>
            <span className="text-[10px] font-semibold text-emerald-700">· Assigned By: {c.assignedBy || 'District Administrator'}</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">
            Assignment Date: {fmt(c.assignedAt || c.reportedAt || c.createdAt)}
          </span>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1 text-sm text-slate-700">

          {/* Species & Farmer Details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900">{c.species}</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Farmer: <span className="font-bold text-slate-800">{c.farmerName}</span> · Phone: <span className="font-mono">{c.farmerPhone || c.contact || 'N/A'}</span>
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusMeta.color}`}>
                {statusMeta.label}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Reported: {fmt(c.reportedAt || c.createdAt)}
              </p>
            </div>
          </div>

          {/* Location & Animals Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-[10px] uppercase font-bold text-slate-400">Village</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{c.village || 'Anjeer Phata'}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-[10px] uppercase font-bold text-slate-400">District</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{c.taluka || c.district || 'Thane'}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-[10px] uppercase font-bold text-slate-400">Affected</p>
              <p className="text-xs font-black text-amber-700 mt-0.5">{c.affectedAnimals ?? 1} Head</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-[10px] uppercase font-bold text-slate-400">Mortality</p>
              <p className="text-xs font-black text-red-700 mt-0.5">{c.deaths ?? 0} Dead</p>
            </div>
          </div>

          {/* Symptoms List */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reported Symptoms</h3>
            <div className="flex flex-wrap gap-1.5">
              {symptomsArr.length > 0 ? (
                symptomsArr.map((s, i) => (
                  <span key={i} className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-emerald-200">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No symptoms itemized</span>
              )}
            </div>
          </div>

          {/* Raw Farmer Complaint / Transcript */}
          {c.rawInput && (
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs">
              <p className="font-bold text-slate-600 mb-1">Farmer Vernacular Transcript:</p>
              <p className="text-slate-800 italic">"{c.rawInput}"</p>
            </div>
          )}

          {/* AI Syndromic Analysis */}
          {(possibleConditions.length > 0 || aiData.explanation) && (
            <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                <Activity className="w-4 h-4 text-purple-600" />
                <span>AI Differential Diagnosis & Triage</span>
              </div>
              {possibleConditions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {possibleConditions.map((cond, idx) => (
                    <span key={idx} className="bg-white text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-md border border-purple-200 shadow-2xs">
                      {typeof cond === 'string' ? cond : cond.condition || cond.name}
                    </span>
                  ))}
                </div>
              )}
              {aiData.explanation && (
                <p className="text-xs text-purple-950/80 leading-relaxed pt-1">
                  {aiData.explanation}
                </p>
              )}
            </div>
          )}

          {/* Clinical Action Form for Attending Veterinarian */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              Clinical Investigation & Status Update
            </h3>

            {/* Status Selector */}
            <div>
              <label className="block font-semibold text-slate-700 text-xs mb-1">Update Case Clinical Status</label>
              <select
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
              >
                <option value="UNDER_INVESTIGATION">Under Investigation (तपासणी सुरू)</option>
                <option value="SUSPECTED">Suspected Outbreak (संशयित प्रादुर्भाव)</option>
                <option value="CONFIRMED">Confirmed Disease (पुष्टी झालेला रोग)</option>
                <option value="RESPONSE">Response Deployed (प्रतिबंधात्मक कृती सुरू)</option>
                <option value="MONITORING">Monitoring (निरीक्षणाखाली)</option>
                <option value="RESOLVED">Resolved / Closed (उपचार पूर्ण)</option>
              </select>
            </div>

            {/* Treatment Notes */}
            <div>
              <label className="block font-semibold text-slate-700 text-xs mb-1">Treatment / Medication Administered</label>
              <textarea
                rows={2}
                placeholder="Enter medications prescribed, dosages, and isolation instructions..."
                value={treatmentNotes}
                onChange={(e) => setTreatmentNotes(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Lab Referral */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="modalLabCheck"
                  checked={labReferral}
                  onChange={(e) => setLabReferral(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-400 cursor-pointer"
                />
                <label htmlFor="modalLabCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Laboratory Sample Collected / Diagnostic Referral Required
                </label>
              </div>

              {labReferral && (
                <textarea
                  rows={2}
                  placeholder="Enter sample type (e.g. blood, swab, tissue), tube barcode, and destination lab..."
                  value={labNotes}
                  onChange={(e) => setLabNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              )}
            </div>

            {msg && (
              <p className={`text-xs font-bold ${msg.includes('Error') ? 'text-red-600' : 'text-emerald-700'}`}>
                {msg}
              </p>
            )}
          </div>

          {/* Coordinates */}
          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-200">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              GPS: {lat !== null && lat !== undefined ? `${lat}° N, ${lng}° E` : 'Bhiwandi / Thane'}
            </span>
            <span className="text-[11px] text-slate-400">Jurisdiction: Thane District</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <Link
            to={`/veterinarian/cases/${caseId}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            <span>Open Full Investigation Form</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Updates'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
