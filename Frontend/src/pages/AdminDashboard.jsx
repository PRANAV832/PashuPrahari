import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  UserPlus,
  Stethoscope,
  AlertTriangle,
  Flame,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  LogOut,
  ArrowUpRight,
  ChevronRight,
  Radio,
  Building2,
  Eye,
  X,
  Send,
  Bell,
  AlertOctagon,
  Sparkles,
  UserCheck,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  mockAdminStats,
  mockRegisteredVets,
  mockAdminCases,
  mockRecentAlerts,
} from '../data/mockAdminData';
import { caseService } from '../services/caseService';
import { userService } from '../services/userService';
import { MapSection } from '../components/map/MapSection';
import { APP_NAME, APP_NAME_DEVANAGARI } from '../utils/constants';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Local state for interactive UI actions
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('ALL'); // ALL, UNASSIGNED, CRITICAL, ASSIGNED
  const [searchTerm, setSearchTerm] = useState('');

  const loadAdminCases = async () => {
    try {
      setError(null);
      const data = await caseService.getCases();
      if (data && Array.isArray(data)) {
        setCases(data);
      } else {
        setCases(mockAdminCases);
      }
    } catch (err) {
      console.warn('Backend getCases failed in Admin Dashboard, using fallback:', err.message);
      setError(err.message);
      setCases(mockAdminCases);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminCases();
  }, []);

  // Modals for Quick Actions
  const [showRegisterFarmerModal, setShowRegisterFarmerModal] = useState(false);
  const [showRegisterVetModal, setShowRegisterVetModal] = useState(false);
  const [modalSuccessMsg, setModalSuccessMsg] = useState('');
  const [modalErrorMsg, setModalErrorMsg] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const [farmerModalData, setFarmerModalData] = useState({
    name: '',
    mobile: '',
    taluka: 'Bhiwandi',
    village: '',
    aadhaar: '',
  });

  const [vetModalData, setVetModalData] = useState({
    name: '',
    mobile: '',
    licenseNo: '',
    assignedHospital: 'Bhiwandi Central Veterinary Dispensary',
  });

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter cases logic
  const filteredCases = cases.filter((c) => {
    const isAssigned = Boolean(c.assignedVet || c.assignedTo);
    const farmerName = c.farmerName || '';
    const village = c.village || '';
    const id = c.id || c._id || '';
    const species = c.species || '';

    const matchesSearch =
      farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      species.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'UNASSIGNED') return !isAssigned;
    if (filterType === 'CRITICAL') return (c.riskLevel || '').toUpperCase() === 'CRITICAL' || (c.riskLevel || '').toUpperCase() === 'HIGH';
    if (filterType === 'ASSIGNED') return isAssigned;
    return true;
  });

  // Calculate live counts
  const unassignedCount = cases.filter((c) => !c.assignedVet && !c.assignedTo).length;
  const criticalCount = cases.filter((c) => (c.riskLevel || '').toUpperCase() === 'CRITICAL').length;

  const handleFarmerSubmit = async (e) => {
    e.preventDefault();
    setModalErrorMsg('');
    setModalSubmitting(true);
    try {
      await userService.registerUser({
        name: farmerModalData.name.trim(),
        phone: farmerModalData.mobile.replace(/\D/g, ''),
        role: 'FARMER',
        roleLabel: 'Registered Livestock Owner / Farmer',
        village: farmerModalData.village.trim(),
        district: 'Thane',
        assignedArea: `${farmerModalData.taluka} Sub-division`,
        status: 'ACTIVE',
      });

      setModalSuccessMsg(`Farmer ${farmerModalData.name} successfully registered in surveillance system.`);
      setFarmerModalData({ name: '', mobile: '', taluka: 'Bhiwandi', village: '', aadhaar: '' });
      setTimeout(() => {
        setModalSuccessMsg('');
        setShowRegisterFarmerModal(false);
      }, 1600);
    } catch (err) {
      setModalErrorMsg(err.message || 'Failed to register farmer.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleVetSubmit = async (e) => {
    e.preventDefault();
    setModalErrorMsg('');
    setModalSubmitting(true);
    try {
      await userService.registerUser({
        name: vetModalData.name.trim(),
        phone: vetModalData.mobile.replace(/\D/g, ''),
        role: 'VETERINARIAN',
        roleLabel: 'Veterinary Officer',
        employeeId: vetModalData.licenseNo.trim() || `VET-MH-${Math.floor(1000 + Math.random() * 9000)}`,
        department: 'Animal Husbandry & Veterinary Services',
        designation: 'Veterinary Officer',
        assignedArea: vetModalData.assignedHospital.trim() || 'Thane District',
        status: 'ACTIVE',
      });

      setModalSuccessMsg(`Veterinarian ${vetModalData.name} successfully authorized.`);
      setVetModalData({ name: '', mobile: '', licenseNo: '', assignedHospital: 'Bhiwandi Central Veterinary Dispensary' });
      setTimeout(() => {
        setModalSuccessMsg('');
        setShowRegisterVetModal(false);
      }, 1600);
    } catch (err) {
      setModalErrorMsg(err.message || 'Failed to register veterinarian.');
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-16">

      {/* ── 1. Header: Veterinary Department Administration ──────────────── */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Top Government Accent Bar */}
        <div className="h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-700 via-indigo-600 to-emerald-600" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left: Department Identity */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-full text-xs font-extrabold tracking-wide">
                <Building2 className="w-3.5 h-3.5 text-purple-600" />
                {mockAdminStats.departmentName}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Surveillance Gateway
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-700 to-indigo-800 text-white flex items-center justify-center shadow-md shadow-purple-200">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {APP_NAME} <span className="text-purple-700 font-normal">|</span> Veterinary Department Administration
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {mockAdminStats.districtUnit} · Integrated Disease Surveillance &amp; Triage Control
                </p>
              </div>
            </div>
          </div>

          {/* Right: Admin Profile & Logout UI */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                HQ
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 leading-none">
                  {user?.name || 'Veterinary Administrator'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Role: <span className="font-semibold text-purple-700">SYSTEM_ADMIN</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-300 text-slate-700 hover:text-red-700 text-xs font-bold shadow-2xs transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

        </div>
      </div>

      {/* ── 5. Quick Actions Bar ────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Administrative Quick Actions:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/assignment"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Case Assignment Queue</span>
          </Link>

          <Link
            to="/admin/users/register-farmer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
            <span>Register Farmer</span>
          </Link>

          <Link
            to="/admin/users/register-veterinarian"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-purple-700" />
            <span>Register Veterinarian</span>
          </Link>

          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-slate-600" />
            <span>User Directory</span>
          </Link>
        </div>
      </div>

      {/* ── 2. Summary Cards (6 Operational KPIs) ────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* KPI 1: Registered Farmers */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Farmers</span>
            <span className="p-1.5 rounded-lg bg-green-50 text-green-700">
              <Users className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{mockAdminStats.registeredFarmers.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400 mt-0.5">Verified Profiles</span>
        </div>

        {/* KPI 2: Registered Veterinarians */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Vets</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <Stethoscope className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{mockAdminStats.registeredVeterinarians}</p>
          <span className="text-[10px] text-slate-400 mt-0.5">Active Field Staff</span>
        </div>

        {/* KPI 3: Unassigned Cases */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Unassigned</span>
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">{unassignedCount}</p>
          <span className="text-[10px] text-amber-700 font-semibold mt-0.5">Awaiting Dispatch</span>
        </div>

        {/* KPI 4: Critical Cases */}
        <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/30 shadow-xs hover:border-red-300 transition-all flex flex-col justify-between ring-1 ring-red-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Critical</span>
            <span className="p-1.5 rounded-lg bg-red-100 text-red-700 animate-pulse">
              <AlertOctagon className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black text-red-600 mt-2">{criticalCount}</p>
          <span className="text-[10px] text-red-700 font-bold mt-0.5">High Priority Tier</span>
        </div>

        {/* KPI 5: Active Investigations */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Active</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black text-blue-700 mt-2">{mockAdminStats.activeInvestigations}</p>
          <span className="text-[10px] text-slate-400 mt-0.5">Sample / Physical</span>
        </div>

        {/* KPI 6: Potential Outbreaks */}
        <div className="bg-white p-4 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">Clusters</span>
            <span className="p-1.5 rounded-lg bg-purple-100 text-purple-800">
              <Flame className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black text-purple-800 mt-2">{mockAdminStats.potentialOutbreaks}</p>
          <span className="text-[10px] text-purple-700 font-semibold mt-0.5">Geofenced Clusters</span>
        </div>

      </div>

      {/* ── 6. Recent Early Warning & Outbreak Alerts ────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Surveillance Alerts &amp; Cluster Warnings</h2>
              <p className="text-xs text-slate-500">Automated geofence triggers and syndromic threshold breaches</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400">Live Stream</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
          {mockRecentAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                alert.severity === 'CRITICAL'
                  ? 'bg-red-50/40 border-red-200 ring-1 ring-red-100'
                  : 'bg-amber-50/30 border-amber-200'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-red-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {alert.severity} ALERT
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {alert.timestamp}
                  </span>
                </div>

                <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                  {alert.title}
                </h3>
                <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  {alert.location}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {alert.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-800">
                <span className="font-bold text-purple-900">Recommended Protocol: </span>
                {alert.actionRequired}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Geospatial Surveillance Map (District & Geofence Matrix) ─────── */}
      <MapSection cases={cases} context="ADMIN" />

      {/* ── 3 & 4. Incoming Case Queue (with Critical Prominence) ───────── */}
      <div id="case-queue-section" className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        
        {/* Queue Header & Filters */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900">Incoming Case Queue &amp; Assignment Matrix</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {filteredCases.length} Cases
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review AI-assessed syndromic complaints and dispatch authorized veterinary surgeons.
            </p>
          </div>

          {/* Search + Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search case, farmer, village..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
              />
            </div>

            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterType === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('UNASSIGNED')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterType === 'UNASSIGNED' ? 'bg-white text-amber-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Unassigned ({unassignedCount})
              </button>
              <button
                onClick={() => setFilterType('CRITICAL')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterType === 'CRITICAL' ? 'bg-white text-red-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Critical / High
              </button>
              <button
                onClick={() => setFilterType('ASSIGNED')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterType === 'ASSIGNED' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Assigned
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-y border-red-200 text-red-700 px-6 py-3 text-xs flex items-center justify-between gap-2">
            <span>Failed to sync live cases: {error} (showing cached fallback)</span>
            <button
              type="button"
              onClick={loadAdminCases}
              className="px-2.5 py-1 bg-red-600 text-white font-bold rounded-lg text-xs hover:bg-red-700 transition-colors"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* High Priority Critical Banner if any critical unassigned */}
        {cases.some((c) => c.riskLevel === 'CRITICAL' && !c.assignedVet) && (
          <div className="bg-red-500 text-white px-6 py-2.5 flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 animate-bounce shrink-0" />
              <span>URGENT TRIAGE: Unassigned Critical Outbreak Risk Case detected in queue.</span>
            </div>
            <button
              onClick={() => setFilterType('CRITICAL')}
              className="px-2.5 py-1 bg-white text-red-700 rounded-lg text-[11px] font-extrabold hover:bg-red-50 transition-colors"
            >
              Filter Critical
            </button>
          </div>
        )}

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Case ID</th>
                <th className="py-3.5 px-4">Farmer</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Species</th>
                <th className="py-3.5 px-4">Risk</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned Veterinarian</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 space-y-2">
                    <Clock className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">Syncing live surveillance case queue...</p>
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 space-y-2">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">No cases found in this filter category.</p>
                    <p className="text-xs text-slate-400">All incoming disease surveillance incidents will appear here automatically.</p>
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => {
                  const isCritical = c.riskLevel === 'CRITICAL';
                  const isHigh = c.riskLevel === 'HIGH';

                return (
                  <tr
                    key={c.id}
                    className={`transition-colors ${
                      isCritical
                        ? 'bg-red-50/30 hover:bg-red-50/60 font-semibold'
                        : isHigh
                        ? 'bg-amber-50/10 hover:bg-amber-50/40'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    {/* Case ID */}
                    <td className="py-4 px-4 sm:px-6 font-mono font-bold">
                      <div className="flex items-center gap-1.5">
                        {isCritical && (
                          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                        )}
                        <Link
                          to={`/veterinarian/cases/${c.id}`}
                          className="text-purple-800 hover:text-purple-900 font-bold hover:underline"
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
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {c.village}
                      </span>
                    </td>

                    {/* Species */}
                    <td className="py-4 px-4">
                      <span className="text-slate-800 font-semibold">{c.species}</span>
                      <p className="text-[10px] text-slate-400">{c.affectedAnimals || 1} affected</p>
                    </td>

                    {/* Risk (Visual Prominence for Critical) */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black border ${
                          isCritical
                            ? 'bg-red-600 text-white border-red-700 shadow-xs shadow-red-200'
                            : isHigh
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : c.riskLevel === 'MODERATE'
                            ? 'bg-yellow-100 text-yellow-900 border-yellow-300'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        }`}
                      >
                        {isCritical && <Flame className="w-3 h-3 text-white" />}
                        {c.riskLevel} ({c.riskScore})
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {c.status}
                      </span>
                    </td>

                    {/* Assigned Veterinarian */}
                    <td className="py-4 px-4">
                      <div>
                        {(c.assignedVet || c.assignedTo) ? (
                          <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            {c.assignedVet || c.assignedTo}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-bold px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[11px]">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Unassigned
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-slate-500 text-[11px] font-mono">
                      {new Date(c.reportedAt || c.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Action (View Details Only — No Assign/Reassign on Admin Dashboard) */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/admin/cases/${c.id || c._id}`}
                          className="p-1.5 rounded-xl border border-slate-200 hover:bg-purple-50 hover:border-purple-300 text-purple-700 font-semibold flex items-center gap-1 transition-colors"
                          title="View Case Investigation Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>

      </div>

      {/* ── Modal 1: Register Farmer Modal Preview ───────────────────────── */}
      {showRegisterFarmerModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Register Livestock Owner / Farmer</h3>
              </div>
              <button
                onClick={() => setShowRegisterFarmerModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {modalSuccessMsg}
              </div>
            )}

            {modalErrorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                {modalErrorMsg}
              </div>
            )}

            {!modalSuccessMsg && (
              <form onSubmit={handleFarmerSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Farmer Full Name (शेतकऱ्याचे नाव) *</label>
                  <input
                    type="text"
                    required
                    value={farmerModalData.name}
                    onChange={(e) => setFarmerModalData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Ramesh Narayan Patil"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={farmerModalData.mobile}
                      onChange={(e) => setFarmerModalData((prev) => ({ ...prev, mobile: e.target.value.replace(/\D/g, '') }))}
                      placeholder="9876543210"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Taluka</label>
                    <select
                      value={farmerModalData.taluka}
                      onChange={(e) => setFarmerModalData((prev) => ({ ...prev, taluka: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
                    >
                      <option value="Bhiwandi">Bhiwandi</option>
                      <option value="Shahapur">Shahapur</option>
                      <option value="Kalyan">Kalyan</option>
                      <option value="Murbad">Murbad</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Village Name (गाव) *</label>
                  <input
                    type="text"
                    required
                    value={farmerModalData.village}
                    onChange={(e) => setFarmerModalData((prev) => ({ ...prev, village: e.target.value }))}
                    placeholder="e.g. Anjeer Phata"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowRegisterFarmerModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalSubmitting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {modalSubmitting ? 'Registering...' : 'Authorize & Register Farmer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Modal 2: Register Veterinarian Modal Preview ─────────────────── */}
      {showRegisterVetModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Register Veterinarian</h3>
              </div>
              <button
                onClick={() => setShowRegisterVetModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalSuccessMsg && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                {modalSuccessMsg}
              </div>
            )}

            {modalErrorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                {modalErrorMsg}
              </div>
            )}

            {!modalSuccessMsg && (
              <form onSubmit={handleVetSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Doctor / Officer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={vetModalData.name}
                    onChange={(e) => setVetModalData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Dr. Priya Patil"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">License / Reg No. *</label>
                    <input
                      type="text"
                      required
                      value={vetModalData.licenseNo}
                      onChange={(e) => setVetModalData((prev) => ({ ...prev, licenseNo: e.target.value }))}
                      placeholder="MSVC-2024-889"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Official Mobile *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={vetModalData.mobile}
                      onChange={(e) => setVetModalData((prev) => ({ ...prev, mobile: e.target.value.replace(/\D/g, '') }))}
                      placeholder="9822011223"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Veterinary Hospital / Unit *</label>
                  <input
                    type="text"
                    required
                    value={vetModalData.assignedHospital}
                    onChange={(e) => setVetModalData((prev) => ({ ...prev, assignedHospital: e.target.value }))}
                    placeholder="e.g. Bhiwandi Central Veterinary Dispensary"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 bg-white"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowRegisterVetModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalSubmitting}
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {modalSubmitting ? 'Registering...' : 'Authorize Field Officer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
