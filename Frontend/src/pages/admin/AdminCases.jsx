import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Eye,
  MapPin,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Flame,
  BadgeCheck,
  RefreshCw,
  Building2,
} from 'lucide-react';
import { caseService } from '../../services/caseService';
import { mockAdminCases } from '../../data/mockAdminData';

const RISK_BADGES = {
  CRITICAL: 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-100 font-black',
  HIGH:     'bg-amber-50 text-amber-800 border-amber-200 font-bold',
  MODERATE: 'bg-yellow-50 text-yellow-800 border-yellow-200 font-semibold',
  LOW:      'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
};

const STATUS_BADGES = {
  REPORTED:            'bg-amber-50 text-amber-800 border-amber-200',
  AI_ASSESSED:         'bg-purple-50 text-purple-800 border-purple-200',
  UNDER_INVESTIGATION: 'bg-blue-50 text-blue-800 border-blue-200',
  SUSPECTED:           'bg-yellow-50 text-yellow-800 border-yellow-200',
  CONFIRMED:           'bg-red-50 text-red-800 border-red-200',
  RESPONSE:            'bg-indigo-50 text-indigo-800 border-indigo-200',
  MONITORING:          'bg-teal-50 text-teal-800 border-teal-200',
  RESOLVED:            'bg-slate-100 text-slate-700 border-slate-200',
};

const ALL = 'ALL';

export const AdminCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [riskFilter, setRiskFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await caseService.getCases();
      if (data && Array.isArray(data) && data.length > 0) {
        setCases(data);
      } else {
        setCases(mockAdminCases);
      }
    } catch (err) {
      console.warn('Failed to fetch cases, using fallback:', err);
      setError(err.message);
      setCases(mockAdminCases);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const isRiskMatch = riskFilter === ALL || (c.riskLevel || '').toUpperCase() === riskFilter;
      const isStatusMatch = statusFilter === ALL || (c.status || '').toUpperCase().replace(/\s+/g, '_') === statusFilter;

      const q = searchTerm.toLowerCase();
      const caseId = c.id || c._id || '';
      const isSearchMatch = !searchTerm || (
        caseId.toLowerCase().includes(q) ||
        (c.farmerName || '').toLowerCase().includes(q) ||
        (c.village || '').toLowerCase().includes(q) ||
        (c.species || '').toLowerCase().includes(q)
      );

      return isRiskMatch && isStatusMatch && isSearchMatch;
    });
  }, [cases, riskFilter, statusFilter, searchTerm]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-700 via-indigo-600 to-emerald-600" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-full flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>Surveillance Case Repository</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Registered Livestock Incidents &amp; Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Comprehensive oversight directory of reported syndromic alerts, AI risk scores, and official case records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCases}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
          Notice: Operating with cached case data ({error}).
        </div>
      )}

      {/* Case Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search case ID, farmer, species, village..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
            >
              <option value={ALL}>All Risk Levels</option>
              <option value="CRITICAL">Critical Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="MODERATE">Moderate Risk</option>
              <option value="LOW">Low Risk</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
            >
              <option value={ALL}>All Statuses</option>
              <option value="REPORTED">Reported</option>
              <option value="UNDER_INVESTIGATION">Under Investigation</option>
              <option value="MONITORING">Monitoring</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Case ID</th>
                <th className="py-3.5 px-4">Farmer</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Species</th>
                <th className="py-3.5 px-4">Risk Level</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned Officer</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
                    Loading cases...
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    No cases match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => {
                  const caseId = c.id || c._id;
                  const isAssigned = Boolean(c.assignedVet || c.assignedTo);
                  return (
                    <tr key={caseId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-mono font-bold">
                        <Link
                          to={`/admin/cases/${caseId}`}
                          className="text-purple-900 hover:text-purple-700 font-black hover:underline"
                        >
                          {caseId}
                        </Link>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900">{c.farmerName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{c.contact || c.farmerPhone}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="flex items-center gap-1 text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {c.village}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold">{c.species}</span>
                        <p className="text-[10px] text-slate-400">{c.affectedAnimals || 1} affected · {c.deaths || 0} dead</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${RISK_BADGES[(c.riskLevel || '').toUpperCase()] || RISK_BADGES.LOW}`}>
                          {c.riskLevel} ({c.riskScore ?? 0})
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${STATUS_BADGES[(c.status || '').toUpperCase().replace(/\s+/g, '_')] || STATUS_BADGES.REPORTED}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {isAssigned ? (
                          <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                            <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                            {c.assignedVet || c.assignedTo}
                          </span>
                        ) : (
                          <span className="text-amber-700 font-bold px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[11px]">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <Link
                          to={`/admin/cases/${caseId}`}
                          className="p-1.5 rounded-xl border border-slate-200 hover:bg-purple-50 hover:border-purple-300 text-purple-700 inline-flex items-center gap-1 text-xs font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
