import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  UserCheck,
  UserX,
  Stethoscope,
  MapPin,
  Calendar,
  AlertTriangle,
  Flame,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  X,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Building2,
  BadgeCheck,
  Activity,
  ArrowUpDown,
  AlertOctagon,
  FileText,
  Radio,
  Eye,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { adminCaseService } from '../../data/mockAdminData';
import { caseService } from '../../services/caseService';
import { userService } from '../../services/userService';

const RISK_BADGES = {
  CRITICAL: 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-100 font-black',
  HIGH:     'bg-amber-50 text-amber-800 border-amber-200 font-bold',
  MODERATE: 'bg-yellow-50 text-yellow-800 border-yellow-200 font-semibold',
  LOW:      'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
};

const RISK_ORDER = {
  CRITICAL: 1,
  HIGH: 2,
  MODERATE: 3,
  LOW: 4,
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

export const AdminCaseAssignment = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState(null);
  const [availableVets, setAvailableVets] = useState(() => adminCaseService.getAvailableVets());

  const fetchCases = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      // Fetch live cases and live registered veterinarians
      const [live, liveVets] = await Promise.all([
        caseService.getCases(),
        userService.getVeterinarians()
      ]);

      if (liveVets && liveVets.length > 0) {
        setAvailableVets(liveVets.map((v) => ({
          id: v._id || v.id,
          _id: v._id || v.id,
          name: v.name,
          designation: v.designation || 'Veterinary Officer',
          department: v.department || 'Animal Husbandry',
          taluka: v.assignedArea || v.district || 'Thane',
          contact: `+91 ${v.phone}`,
          activeCases: 0,
          isAvailable: v.status === 'ACTIVE'
        })));
      } else {
        setAvailableVets(adminCaseService.getAvailableVets());
      }

      setCases(live.length > 0 ? live : adminCaseService.getCases());
    } catch (err) {
      console.error('Failed to fetch cases for assignment:', err);
      setFetchError(err.message || 'Failed to fetch case list');
      setCases(adminCaseService.getCases());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  // Modal State
  const [selectedCaseForAssignment, setSelectedCaseForAssignment] = useState(null);
  const [selectedVetId, setSelectedVetId] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Filters State
  const [riskFilter, setRiskFilter] = useState(ALL);
  const [assignmentFilter, setAssignmentFilter] = useState(ALL); // 'ALL' | 'UNASSIGNED' | 'ASSIGNED'
  const [locationFilter, setLocationFilter] = useState(ALL);
  const [speciesFilter, setSpeciesFilter] = useState(ALL);
  const [dateFilter, setDateFilter] = useState(ALL); // 'ALL' | 'TODAY' | 'LAST_3_DAYS' | 'LAST_7_DAYS'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('PRIORITY'); // 'PRIORITY' | 'NEWEST'

  // Summary KPIs (6 metrics)
  const stats = useMemo(() => {
    const totalCases = cases.length;
    const unassigned = cases.filter((c) => !c.assignedVet && !c.assignedTo).length;
    const critical = cases.filter((c) => (c.riskLevel || '').toUpperCase() === 'CRITICAL').length;
    const highRisk = cases.filter((c) => (c.riskLevel || '').toUpperCase() === 'HIGH').length;
    const underInvestigation = cases.filter((c) => (c.status || '').toUpperCase() === 'UNDER_INVESTIGATION' || (c.status || '').toUpperCase() === 'RESPONSE').length;
    const resolved = cases.filter((c) => (c.status || '').toUpperCase() === 'RESOLVED').length;

    return {
      totalCases,
      unassigned,
      critical,
      highRisk,
      underInvestigation,
      resolved,
    };
  }, [cases]);

  // Dynamic filter options
  const locationOptions = useMemo(() => {
    const locs = new Set(cases.map((c) => c.taluka || c.village).filter(Boolean));
    return [ALL, ...Array.from(locs)];
  }, [cases]);

  const speciesOptions = useMemo(() => {
    const sps = new Set(cases.map((c) => c.species).filter(Boolean));
    return [ALL, ...Array.from(sps)];
  }, [cases]);

  // Filter & Sort Logic
  const filteredAndSortedCases = useMemo(() => {
    const now = new Date();

    const filtered = cases.filter((c) => {
      const isAssigned = Boolean(c.assignedVet || c.assignedTo);

      // Assignment status filter
      if (assignmentFilter === 'UNASSIGNED' && isAssigned) return false;
      if (assignmentFilter === 'ASSIGNED' && !isAssigned) return false;

      // Risk filter
      if (riskFilter !== ALL && (c.riskLevel || '').toUpperCase() !== riskFilter) return false;

      // Location filter
      if (locationFilter !== ALL && (c.taluka !== locationFilter && c.village !== locationFilter)) return false;

      // Species filter
      if (speciesFilter !== ALL && c.species !== speciesFilter) return false;

      // Date filter
      if (dateFilter !== ALL) {
        const caseDate = new Date(c.reportedAt || c.createdAt);
        const diffHours = (now - caseDate) / (1000 * 60 * 60);

        if (dateFilter === 'TODAY' && diffHours > 24) return false;
        if (dateFilter === 'LAST_3_DAYS' && diffHours > 72) return false;
        if (dateFilter === 'LAST_7_DAYS' && diffHours > 168) return false;
      }

      // Search term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const caseId = c.id || c._id || '';
        const vetName = c.assignedVet || c.assignedTo || '';
        return (
          caseId.toLowerCase().includes(q) ||
          (c.farmerName || '').toLowerCase().includes(q) ||
          (c.village || '').toLowerCase().includes(q) ||
          (c.species || '').toLowerCase().includes(q) ||
          vetName.toLowerCase().includes(q)
        );
      }

      return true;
    });

    // Sorting: 1. Critical -> 2. High -> 3. Moderate -> 4. Low -> 5. Newest
    return filtered.sort((a, b) => {
      if (sortBy === 'PRIORITY') {
        const orderA = RISK_ORDER[(a.riskLevel || '').toUpperCase()] || 99;
        const orderB = RISK_ORDER[(b.riskLevel || '').toUpperCase()] || 99;
        if (orderA !== orderB) return orderA - orderB;
      }
      return new Date(b.reportedAt || b.createdAt) - new Date(a.reportedAt || a.createdAt);
    });
  }, [cases, assignmentFilter, riskFilter, locationFilter, speciesFilter, dateFilter, searchTerm, sortBy]);

  const hasActiveFilters =
    riskFilter !== ALL ||
    assignmentFilter !== ALL ||
    locationFilter !== ALL ||
    speciesFilter !== ALL ||
    dateFilter !== ALL ||
    searchTerm;

  const clearAllFilters = () => {
    setRiskFilter(ALL);
    setAssignmentFilter(ALL);
    setLocationFilter(ALL);
    setSpeciesFilter(ALL);
    setDateFilter(ALL);
    setSearchTerm('');
  };

  // Open assignment modal
  const handleOpenAssignModal = (caseItem) => {
    setSelectedCaseForAssignment(caseItem);
    setSelectedVetId(caseItem.assignedVetId || availableVets[0]?.id || '');
    setAssignError(null);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedCaseForAssignment(null);
    setSelectedVetId('');
    setAssignError(null);
  };

  // Confirm assignment in backend & local state
  const handleConfirmAssignment = async (e) => {
    e.preventDefault();
    if (!selectedCaseForAssignment || !selectedVetId) return;

    const chosenVet = availableVets.find((v) => (v.id === selectedVetId || v._id === selectedVetId));
    if (!chosenVet) return;

    const targetId = selectedCaseForAssignment.id || selectedCaseForAssignment._id;
    setIsAssigning(true);
    setAssignError(null);

    try {
      await caseService.updateCase(targetId, {
        assignedVet: chosenVet.name,
        assignedTo: chosenVet.name,
        assignedVetId: chosenVet._id || chosenVet.id,
        assignedRole: chosenVet.designation || 'Veterinary Officer',
        status: 'UNDER_INVESTIGATION',
        assignedAt: new Date().toISOString(),
      });

      // Update mock service if active
      adminCaseService.assignVeterinarian(targetId, chosenVet);

      await fetchCases();

      setFeedback({
        type: 'success',
        message: `Case ${selectedCaseForAssignment.id || targetId} successfully assigned to ${chosenVet.name} (${chosenVet.taluka}).`,
      });
      setTimeout(() => setFeedback(null), 4000);
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save assignment:', err);
      setAssignError(err.message || 'Failed to dispatch assignment');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-700 via-indigo-600 to-emerald-600" />

        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-full flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-purple-600" />
              <span>District Veterinary Administration · Case Assignment Matrix</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Case Prioritization &amp; Field Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Prioritize incoming disease reports by risk severity, triage unassigned livestock alerts, and assign qualified veterinary surgeons.
          </p>
        </div>

        {/* Quick Outbreak Status Pill */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
          <div className="px-4 py-2 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-bold flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-red-600 animate-pulse" />
            <span>{stats.critical} Critical Alerts</span>
          </div>
        </div>
      </div>

      {/* ── Feedback Notification ────────────────────────────────────────── */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 hover:text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {/* ── 1. Summary: 6 Key Metrics ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Metric 1: Total Cases */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Cases</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <FileText className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{stats.totalCases}</p>
          <span className="text-[10px] text-slate-400 mt-0.5">Reported in District</span>
        </div>

        {/* Metric 2: Unassigned */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Unassigned</span>
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-2">{stats.unassigned}</p>
          <span className="text-[10px] text-amber-700 font-bold mt-0.5">Awaiting Dispatch</span>
        </div>

        {/* Metric 3: Critical */}
        <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/30 shadow-xs flex flex-col justify-between ring-1 ring-red-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Critical</span>
            <span className="p-1.5 rounded-lg bg-red-100 text-red-700 animate-pulse">
              <AlertOctagon className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-red-600 mt-2">{stats.critical}</p>
          <span className="text-[10px] text-red-700 font-bold mt-0.5">Outbreak Risk</span>
        </div>

        {/* Metric 4: High Risk */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">High Risk</span>
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-2">{stats.highRisk}</p>
          <span className="text-[10px] text-amber-700 font-semibold mt-0.5">Field Inspection</span>
        </div>

        {/* Metric 5: Under Investigation */}
        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Investigating</span>
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
              <Stethoscope className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-700 mt-2">{stats.underInvestigation}</p>
          <span className="text-[10px] text-blue-700 font-semibold mt-0.5">Vet Dispatched</span>
        </div>

        {/* Metric 6: Resolved */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Resolved</span>
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2">{stats.resolved}</p>
          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">Closed Records</span>
        </div>

      </div>

      {/* ── 2 & 3. Filters & Sorting Control Bar ─────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        
        {/* Top filter row: Search + Sort Toggle + Clear */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by case ID, farmer, species, village, or vet..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Sort Controller */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setSortBy('PRIORITY')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  sortBy === 'PRIORITY'
                    ? 'bg-white text-purple-900 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-red-600" />
                <span>Priority Sort (Critical ➔ Low)</span>
              </button>

              <button
                onClick={() => setSortBy('NEWEST')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  sortBy === 'NEWEST'
                    ? 'bg-white text-purple-900 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Newest First</span>
              </button>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-colors shrink-0"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Multi-Filters Grid: Risk, Assignment Status, Location, Species, Date */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          
          {/* Filter 1: Risk Level */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Risk Level
            </label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold text-slate-800"
            >
              <option value={ALL}>All Risk Tiers</option>
              <option value="CRITICAL">1. Critical (Urgent)</option>
              <option value="HIGH">2. High Risk</option>
              <option value="MODERATE">3. Moderate Risk</option>
              <option value="LOW">4. Low Risk</option>
            </select>
          </div>

          {/* Filter 2: Assignment Status */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Assignment Status
            </label>
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold text-slate-800"
            >
              <option value={ALL}>All Assignment Status</option>
              <option value="UNASSIGNED">Unassigned Only ({stats.unassigned})</option>
              <option value="ASSIGNED">Assigned to Vet</option>
            </select>
          </div>

          {/* Filter 3: Location / Taluka */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Location / Circle
            </label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold text-slate-800"
            >
              <option value={ALL}>All Circles / Talukas</option>
              {locationOptions.filter((l) => l !== ALL).map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Filter 4: Species */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Livestock Species
            </label>
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold text-slate-800"
            >
              <option value={ALL}>All Species</option>
              {speciesOptions.filter((s) => s !== ALL).map((sp) => (
                <option key={sp} value={sp}>{sp}</option>
              ))}
            </select>
          </div>

          {/* Filter 5: Date Window */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Reported Date
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold text-slate-800"
            >
              <option value={ALL}>All Time</option>
              <option value="TODAY">Reported Today (24h)</option>
              <option value="LAST_3_DAYS">Last 3 Days</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
            </select>
          </div>

        </div>

      </div>

      {/* ── 4. Case Prioritization Queue Table ───────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        
        {/* Table Header Banner */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">Prioritized Incident Queue</h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                {filteredAndSortedCases.length} Matching Records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Sorted by: <strong className="text-slate-800">{sortBy === 'PRIORITY' ? 'Critical ➔ High ➔ Moderate ➔ Low' : 'Latest Reported Timestamp'}</strong>
            </p>
          </div>

          {/* Unassigned Quick Counter */}
          {stats.unassigned > 0 && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold self-start sm:self-center">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>{stats.unassigned} cases need veterinary officer allocation</span>
            </div>
          )}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Case ID</th>
                <th className="py-3.5 px-4">Farmer</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Species</th>
                <th className="py-3.5 px-4">Risk Severity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned Veterinarian</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 space-y-2">
                    <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">Loading cases for allocation...</p>
                  </td>
                </tr>
              ) : filteredAndSortedCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 space-y-2">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">No cases match the selected prioritization filters.</p>
                  </td>
                </tr>
              ) : (
                filteredAndSortedCases.map((c) => {
                  const isAssigned = Boolean(c.assignedVet);
                  const isCritical = c.riskLevel === 'CRITICAL';
                  const isHigh = c.riskLevel === 'HIGH';

                  return (
                    <tr
                      key={c.id}
                      className={`transition-colors ${
                        !isAssigned
                          ? 'bg-amber-50/25 hover:bg-amber-50/50 ring-1 ring-amber-100/50'
                          : isCritical
                          ? 'bg-red-50/20 hover:bg-red-50/40'
                          : 'hover:bg-slate-50/60'
                      }`}
                    >
                      {/* Case ID */}
                      <td className="py-4 px-4 sm:px-6 font-mono font-bold">
                        <div className="flex items-center gap-2">
                          {isCritical && (
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                          )}
                          <Link
                            to={`/veterinarian/cases/${c.id}`}
                            className="text-purple-900 hover:text-purple-700 font-black hover:underline"
                          >
                            {c.id}
                          </Link>
                        </div>
                      </td>

                      {/* Farmer */}
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900">{c.farmerName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{c.contact}</p>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4">
                        <span className="text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {c.village}, {c.taluka}
                        </span>
                      </td>

                      {/* Species */}
                      <td className="py-4 px-4 text-slate-800">
                        <span className="font-semibold">{c.species}</span>
                        <p className="text-[10px] text-slate-400">{c.affectedAnimals} affected · {c.deaths || 0} dead</p>
                      </td>

                      {/* Risk Severity */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] border ${
                            RISK_BADGES[c.riskLevel] || RISK_BADGES.LOW
                          }`}
                        >
                          {isCritical && <Flame className="w-3.5 h-3.5 text-red-600" />}
                          {c.riskLevel} ({c.riskScore})
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            STATUS_BADGES[c.status] || STATUS_BADGES.REPORTED
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>

                      {/* Assigned Veterinarian (Prominent Unassigned vs Assigned) */}
                      <td className="py-4 px-4">
                        {isAssigned ? (
                          <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl w-fit">
                            <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Assigned to {c.assignedVet}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl w-fit shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0 animate-pulse" />
                            <span>UNASSIGNED (ACTION REQUIRED)</span>
                          </div>
                        )}
                      </td>

                      {/* Action: Prominent Assign Veterinarian button */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        {isAssigned ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenAssignModal(c)}
                              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                            >
                              Reassign
                            </button>
                            <Link
                              to={`/admin/cases/${c.id || c._id}`}
                              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenAssignModal(c)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-xl shadow-md shadow-purple-200 transition-all cursor-pointer hover:scale-[1.03]"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span>Assign Veterinarian</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Displaying <strong>{filteredAndSortedCases.length}</strong> of {cases.length} cases
          </span>
          <span className="font-semibold text-purple-900">
            PashuPrahari Early Warning &amp; Veterinary Operations Matrix
          </span>
        </div>
      </div>

      {/* ── ASSIGNMENT MODAL PANEL ────────────────────────────────────────── */}
      {selectedCaseForAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden space-y-0 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Assign Field Veterinarian
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official officer allocation for Case #{selectedCaseForAssignment.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-xl hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmAssignment} className="p-6 space-y-5">
              
              {/* Target Case Information */}
              <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-2 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Incident Information
                </span>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Farmer:</span>
                    <strong className="text-slate-900">{selectedCaseForAssignment.farmerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Species:</span>
                    <strong className="text-slate-900">{selectedCaseForAssignment.species}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Location:</span>
                    <strong className="text-slate-900">{selectedCaseForAssignment.village}, {selectedCaseForAssignment.taluka}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Risk Tier:</span>
                    <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] ${RISK_BADGES[selectedCaseForAssignment.riskLevel]}`}>
                      {selectedCaseForAssignment.riskLevel} ({selectedCaseForAssignment.riskScore})
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px]">Symptoms:</span>
                    <span className="text-slate-800 font-medium">
                      {(selectedCaseForAssignment.symptoms || []).join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommended / Available Veterinarians List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Select Available Veterinarian:
                  </label>
                  <span className="text-[11px] text-purple-700 font-semibold">
                    {availableVets.length} Officers on Duty
                  </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {availableVets.map((vet) => {
                    const isSelected = selectedVetId === vet.id;
                    const isLocalJurisdiction =
                      selectedCaseForAssignment.taluka &&
                      vet.taluka.toLowerCase().includes(selectedCaseForAssignment.taluka.toLowerCase());

                    // Calculate active cases count dynamically from current cases dataset
                    const activeCount = cases.filter((c) => {
                      const isResolved = (c.status || '').toUpperCase().replace(/\s+/g, '_') === 'RESOLVED';
                      if (isResolved) return false;

                      const vId = (vet.id || vet._id || '').toString().trim();
                      const vEmpId = (vet.employeeId || '').trim();
                      const vName = (vet.name || '').toLowerCase().trim();

                      const caseVetId = (c.assignedVetId || '').toString().trim();
                      const caseVetName = (c.assignedVet || c.assignedTo || '').toLowerCase().trim();

                      if (vId && caseVetId && caseVetId === vId) return true;
                      if (vEmpId && caseVetId && caseVetId === vEmpId) return true;
                      if (vName && caseVetName && (caseVetName === vName || caseVetName.includes(vName) || vName.includes(caseVetName))) return true;

                      return false;
                    }).length;

                    return (
                      <label
                        key={vet.id}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-200'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="selectedVet"
                            value={vet.id}
                            checked={isSelected}
                            onChange={() => setSelectedVetId(vet.id)}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />

                          <div className="space-y-0.5 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{vet.name}</span>
                              {isLocalJurisdiction && (
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                                  Local Jurisdiction
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {vet.designation} · {vet.department}
                            </p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {vet.taluka}
                            </p>
                          </div>
                        </div>

                        {/* Active Case Load */}
                        <div className="text-right shrink-0">
                          <span className={`inline-block px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                            activeCount > 2 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {activeCount} active cases
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {assignError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{assignError}</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isAssigning}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedVetId || isAssigning}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  {isAssigning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Dispatching Assignment...</span>
                    </>
                  ) : (
                    <span>Confirm &amp; Dispatch Assignment</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
