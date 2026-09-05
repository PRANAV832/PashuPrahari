import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Clock,
  Search,
  ChevronDown,
  Eye,
  Skull,
  Filter,
  X,
  Stethoscope,
  CheckCircle2,
  BadgeCheck,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { mockCases } from '../../data/mockCases';
import { CaseDetailModal } from './CaseDetailModal';

// ── constants ─────────────────────────────────────────────────────────────────

const RISK_BADGE = {
  CRITICAL: 'bg-red-100 text-red-700 border-red-300 ring-1 ring-red-200 font-black',
  HIGH:     'bg-amber-100 text-amber-700 border-amber-300 font-bold',
  MODERATE: 'bg-yellow-100 text-yellow-800 border-yellow-300 font-semibold',
  LOW:      'bg-emerald-100 text-emerald-700 border-emerald-300 font-medium',
  PENDING:  'bg-slate-100 text-slate-700 border-slate-300',
};

const RISK_DOT = {
  CRITICAL: 'bg-red-500',
  HIGH:     'bg-amber-500',
  MODERATE: 'bg-yellow-400',
  LOW:      'bg-emerald-500',
  PENDING:  'bg-slate-400',
};

const STATUS_META = {
  REPORTED:            { label: 'Reported',            color: 'bg-orange-100 text-orange-800 border-orange-200' },
  UNDER_REVIEW:        { label: 'Under Review',        color: 'bg-purple-100 text-purple-800 border-purple-200' },
  AI_ASSESSED:         { label: 'AI Assessed',         color: 'bg-purple-100 text-purple-800 border-purple-200' },
  INVESTIGATING:       { label: 'Investigating',       color: 'bg-blue-100 text-blue-800 border-blue-200'   },
  UNDER_INVESTIGATION: { label: 'Under Investigation', color: 'bg-blue-100 text-blue-800 border-blue-200'   },
  SUSPECTED:           { label: 'Suspected',           color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  CONFIRMED:           { label: 'Confirmed',           color: 'bg-red-100 text-red-800 border-red-200'     },
  RESPONSE:            { label: 'Response Deployed',   color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  MONITORING:          { label: 'Monitoring',          color: 'bg-teal-100 text-teal-800 border-teal-200'  },
  RESOLVED:            { label: 'Resolved',            color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const ALL = 'ALL';

const ALL_RISK_LEVELS  = [ALL, 'CRITICAL', 'HIGH', 'MODERATE', 'LOW', 'PENDING'];
const ALL_STATUS_VALUES = [ALL, ...Object.keys(STATUS_META)];

// ── helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (iso) => {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// ── sub-components ────────────────────────────────────────────────────────────

const StatCard = ({ label, value, delta, icon, valueColor = 'text-slate-900', accent }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-1.5 hover:shadow-md transition-shadow ${accent}`}>
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      {icon}
    </div>
    <p className={`text-2xl sm:text-3xl font-black ${valueColor}`}>{value}</p>
    {delta && <p className="text-[11px] text-slate-400 font-medium">{delta}</p>}
  </div>
);

const FilterSelect = ({ label, value, onChange, options }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none pl-3 pr-8 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm cursor-pointer hover:border-emerald-400 transition-colors"
      aria-label={label}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt === ALL ? `${label}: All` : STATUS_META[opt]?.label ?? opt}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
  </div>
);

// ── main component ────────────────────────────────────────────────────────────

export const VetDashboard = ({ cases: propsCases, onRefresh, loading }) => {
  const [selectedCase, setSelectedCase] = useState(null);
  const [filterRisk,    setFilterRisk]    = useState(ALL);
  const [filterStatus,  setFilterStatus]  = useState(ALL);
  const [filterSpecies, setFilterSpecies] = useState(ALL);
  const [search,        setSearch]        = useState('');

  const activeCases = propsCases !== undefined ? propsCases : mockCases;
  const ALL_SPECIES = useMemo(() => [ALL, ...Array.from(new Set(activeCases.map((c) => c.species).filter(Boolean)))], [activeCases]);

  // ── 6 Required KPI Summary metrics ──────────────────────────────────────────
  const totalAssigned       = activeCases.length;
  const criticalCount       = activeCases.filter((c) => (c.riskLevel || '').toUpperCase() === 'CRITICAL').length;
  const highRiskCount       = activeCases.filter((c) => (c.riskLevel || '').toUpperCase() === 'HIGH').length;
  const underInvestigation  = activeCases.filter((c) => {
    const s = (c.status || '').toUpperCase().replace(/\s+/g, '_');
    return ['UNDER_INVESTIGATION', 'INVESTIGATING', 'UNDER_REVIEW', 'REPORTED'].includes(s);
  }).length;
  const monitoringCount     = activeCases.filter((c) => (c.status || '').toUpperCase().replace(/\s+/g, '_') === 'MONITORING').length;
  const resolvedCount       = activeCases.filter((c) => (c.status || '').toUpperCase().replace(/\s+/g, '_') === 'RESOLVED').length;

  // ── client-side filtering ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return activeCases.filter((c) => {
      const riskKey = (c.riskLevel || 'Pending').toUpperCase();
      const statusKey = (c.status || 'Reported').toUpperCase().replace(/\s+/g, '_');

      if (filterRisk    !== ALL && riskKey !== filterRisk)   return false;
      if (filterStatus  !== ALL && statusKey !== filterStatus) return false;
      if (filterSpecies !== ALL && c.species !== filterSpecies) return false;
      if (search) {
        const q = search.toLowerCase();
        const caseId = c.id || c._id || '';
        return (
          (c.farmerName || '').toLowerCase().includes(q) ||
          (c.village || '').toLowerCase().includes(q)    ||
          (c.species || '').toLowerCase().includes(q)    ||
          caseId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeCases, filterRisk, filterStatus, filterSpecies, search]);

  const hasActiveFilters = filterRisk !== ALL || filterStatus !== ALL || filterSpecies !== ALL || search;

  const clearFilters = () => {
    setFilterRisk(ALL);
    setFilterStatus(ALL);
    setFilterSpecies(ALL);
    setSearch('');
  };

  return (
    <>
      <div className="space-y-6">

        {/* ── Summary Cards (6 Required KPIs) ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          <StatCard
            label="Assigned Cases"
            value={totalAssigned}
            delta="In your jurisdiction"
            icon={<Stethoscope className="w-4 h-4 text-emerald-600" />}
            valueColor="text-slate-900"
            accent="border-l-4 border-l-emerald-500"
          />
          <StatCard
            label="Critical"
            value={criticalCount}
            delta="Urgent intervention"
            icon={<Skull className="w-4 h-4 text-red-500" />}
            valueColor="text-red-600"
            accent="border-l-4 border-l-red-500"
          />
          <StatCard
            label="High Risk"
            value={highRiskCount}
            delta="Priority inspection"
            icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
            valueColor="text-amber-600"
            accent="border-l-4 border-l-amber-500"
          />
          <StatCard
            label="Under Investigation"
            value={underInvestigation}
            delta="Active field cases"
            icon={<Activity className="w-4 h-4 text-blue-500" />}
            valueColor="text-blue-600"
            accent="border-l-4 border-l-blue-400"
          />
          <StatCard
            label="Monitoring"
            value={monitoringCount}
            delta="Post-treatment watch"
            icon={<Clock className="w-4 h-4 text-teal-500" />}
            valueColor="text-teal-600"
            accent="border-l-4 border-l-teal-400"
          />
          <StatCard
            label="Resolved"
            value={resolvedCount}
            delta="Successfully closed"
            icon={<CheckCircle2 className="w-4 h-4 text-slate-500" />}
            valueColor="text-slate-700"
            accent="border-l-4 border-l-slate-400"
          />
        </div>

        {/* ── MY ASSIGNED CASES SECTION ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Section Header & Filters */}
          <div className="px-6 py-5 border-b border-slate-100 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-900 text-lg">MY ASSIGNED CASES (माझे नियुक्त रुग्ण अहवाल)</h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <BadgeCheck className="w-3 h-3 text-emerald-600" />
                    Allocated to You
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing <span className="font-semibold text-emerald-700">{filtered.length}</span> of {totalAssigned} assigned clinical cases for physical inspection and diagnostic recording.
                </p>
              </div>

              {/* Search */}
              <div className="relative flex-shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search farmer, village, species…"
                  className="pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 w-60 placeholder:text-slate-400 transition-all"
                />
              </div>
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
              <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <FilterSelect label="Risk Level" value={filterRisk}    onChange={setFilterRisk}    options={ALL_RISK_LEVELS}  />
              <FilterSelect label="Status"     value={filterStatus}  onChange={setFilterStatus}  options={ALL_STATUS_VALUES} />
              <FilterSelect label="Species"    value={filterSpecies} onChange={setFilterSpecies} options={ALL_SPECIES}       />
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">Case ID</th>
                  <th className="py-3 px-4 whitespace-nowrap">Farmer</th>
                  <th className="py-3 px-4 whitespace-nowrap">Location</th>
                  <th className="py-3 px-4 whitespace-nowrap">Species</th>
                  <th className="py-3 px-4 whitespace-nowrap">Risk</th>
                  <th className="py-3 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 whitespace-nowrap">Assigned Date</th>
                  <th className="py-3 px-4 whitespace-nowrap text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-sm text-slate-400">
                      No assigned cases match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => {
                    const caseId = c.id || c._id || 'N/A';
                    const riskKey = (c.riskLevel || 'Pending').toUpperCase();
                    const statusKey = (c.status || 'Reported').toUpperCase().replace(/\s+/g, '_');
                    const riskClass  = RISK_BADGE[riskKey]  ?? RISK_BADGE.PENDING;
                    const riskDot    = RISK_DOT[riskKey]    ?? RISK_DOT.PENDING;
                    const statusMeta = STATUS_META[statusKey] ?? { label: c.status || 'Reported', color: 'bg-slate-100 text-slate-700 border-slate-200' };
                    const assignedDate = c.assignedAt || c.reportedAt || c.createdAt;

                    return (
                      <tr
                        key={caseId}
                        className="hover:bg-emerald-50/20 transition-colors group"
                      >
                        {/* Case ID */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md max-w-[120px] truncate block" title={caseId}>
                            {caseId.length > 12 ? `${caseId.slice(-8)}` : caseId}
                          </span>
                        </td>

                        {/* Farmer */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 text-xs whitespace-nowrap">{c.farmerName}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{c.farmerPhone || c.contact || 'No phone'}</p>
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                          <p className="font-medium text-slate-800">{c.village || 'Anjeer Phata'}</p>
                          <p className="text-[11px] text-slate-400">{c.taluka || c.district || 'Thane'}</p>
                        </td>

                        {/* Species */}
                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-800 whitespace-nowrap">
                          {c.species}
                        </td>

                        {/* Risk */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${riskDot}`} />
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${riskClass}`}>
                              {c.riskLevel || 'Pending'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{c.riskScore ?? 0}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${statusMeta.color}`}>
                            {statusMeta.label}
                          </span>
                        </td>

                        {/* Assigned Date */}
                        <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                          {fmtDate(assignedDate)}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedCase(c)}
                              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                              title="Quick Preview"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              to={`/veterinarian/cases/${caseId}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-xs cursor-pointer"
                            >
                              <span>Investigate</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <span>{filtered.length} assigned case{filtered.length !== 1 ? 's' : ''} in jurisdiction</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[11px]"><span className="w-2 h-2 rounded-full bg-red-500" /> Critical</span>
              <span className="flex items-center gap-1 text-[11px]"><span className="w-2 h-2 rounded-full bg-amber-500" /> High</span>
              <span className="flex items-center gap-1 text-[11px]"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Moderate</span>
              <span className="flex items-center gap-1 text-[11px]"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Low</span>
            </div>
          </div>
        </div>

      </div>

      {/* Case Detail Modal */}
      {selectedCase && (
        <CaseDetailModal
          case={selectedCase}
          onClose={() => setSelectedCase(null)}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
};
