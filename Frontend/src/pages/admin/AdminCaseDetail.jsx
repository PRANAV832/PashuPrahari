import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Calendar,
  AlertTriangle,
  User,
  Activity,
  CheckCircle2,
  FlaskConical,
  TestTube,
  Building2,
  Pill,
  FileText,
  Clock,
  UserCheck,
  Stethoscope,
  RefreshCw,
  AlertOctagon,
  Eye,
  MessageSquare,
  BadgeCheck,
  Lock,
} from 'lucide-react';
import { caseService } from '../../services/caseService';
import { userService } from '../../services/userService';
import { AIAnalysisResult } from '../../components/farmer/AIAnalysisResult';

const STATUS_BADGES = {
  REPORTED:            'bg-amber-50 text-amber-800 border-amber-200',
  UNDER_REVIEW:        'bg-purple-50 text-purple-800 border-purple-200',
  AI_ASSESSED:         'bg-purple-50 text-purple-800 border-purple-200',
  UNDER_INVESTIGATION: 'bg-blue-50 text-blue-800 border-blue-200',
  SUSPECTED:           'bg-yellow-50 text-yellow-800 border-yellow-200',
  CONFIRMED:           'bg-red-50 text-red-800 border-red-200',
  RESPONSE:            'bg-indigo-50 text-indigo-800 border-indigo-200',
  MONITORING:          'bg-teal-50 text-teal-800 border-teal-200',
  RESOLVED:            'bg-slate-100 text-slate-700 border-slate-200',
  ESCALATED:           'bg-red-100 text-red-900 border-red-300 font-bold',
};

export const AdminCaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Administrative action states
  const [availableVets, setAvailableVets] = useState([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedVetId, setSelectedVetId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [adminStatus, setAdminStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadCaseAndVets = async () => {
    try {
      setErrorMessage(null);
      const [loaded, vets] = await Promise.all([
        caseService.getCaseById(id),
        userService.getVeterinarians()
      ]);

      if (loaded) {
        setCaseData(loaded);
        setAdminStatus(loaded.status || 'REPORTED');
        setSelectedVetId(loaded.assignedVetId || (vets[0]?._id || vets[0]?.id || ''));
      } else {
        setErrorMessage(`Case ID #${id} not found in surveillance registry.`);
      }

      if (vets && Array.isArray(vets)) {
        setAvailableVets(vets);
      }
    } catch (err) {
      console.error('Failed to load case for admin oversight:', err);
      setErrorMessage(err.message || 'Failed to load case');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCaseAndVets();
  }, [id]);

  const showNotification = (msg, type = 'success') => {
    setFeedback({ text: msg, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // ADMIN ACTION: Assign or Reassign Veterinarian
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVetId) return;

    const chosenVet = availableVets.find((v) => (v._id === selectedVetId || v.id === selectedVetId));
    if (!chosenVet) return;

    setIsAssigning(true);
    try {
      const targetId = caseData.id || caseData._id;
      const updated = await caseService.updateCase(targetId, {
        assignedVet: chosenVet.name,
        assignedTo: chosenVet.name,
        assignedVetId: chosenVet._id || chosenVet.id,
        assignedRole: chosenVet.designation || 'Veterinary Officer',
        status: 'UNDER_INVESTIGATION',
      });

      if (updated) {
        setCaseData(updated);
        setAdminStatus('UNDER_INVESTIGATION');
        showNotification(`Veterinarian successfully assigned to ${chosenVet.name} (${chosenVet.assignedArea || 'Thane'}).`);
        setIsAssignModalOpen(false);
      }
    } catch (err) {
      showNotification(`Failed to assign veterinarian: ${err.message}`, 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  // ADMIN ACTION: Escalate or Update Administrative Status
  const handleAdminStatusChange = async (newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const targetId = caseData.id || caseData._id;
      const updated = await caseService.updateCase(targetId, {
        status: newStatus,
      });

      if (updated) {
        setCaseData(updated);
        setAdminStatus(newStatus);
        showNotification(`Case administrative status updated to ${newStatus}.`);
      }
    } catch (err) {
      showNotification(`Failed to update status: ${err.message}`, 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (errorMessage || !caseData) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Case Record Not Found</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          {errorMessage || `The requested Case ID #${id} was not found in the district surveillance registry.`}
        </p>
        <div className="pt-2">
          <Link
            to="/admin/cases"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Case Assignment Queue
          </Link>
        </div>
      </div>
    );
  }

  const inv = caseData.investigation || {};
  const statusBadge = STATUS_BADGES[caseData.status] || STATUS_BADGES.REPORTED;
  const isAssigned = Boolean(caseData.assignedVetId || caseData.assignedVet || caseData.assignedTo);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">

      {/* ── Breadcrumb & Top Bar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/admin/cases"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Case Assignment Queue</span>
        </Link>

        {/* Administrative Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAssignModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{isAssigned ? 'Reassign Veterinarian' : 'Assign Veterinarian'}</span>
          </button>

          {caseData.status !== 'SUSPECTED' && caseData.status !== 'ESCALATED' && (
            <button
              type="button"
              onClick={() => handleAdminStatusChange('SUSPECTED')}
              disabled={isUpdatingStatus}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 text-xs font-bold transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Flag as Suspected Outbreak</span>
            </button>
          )}

          {caseData.status !== 'ESCALATED' && (
            <button
              type="button"
              onClick={() => handleAdminStatusChange('ESCALATED')}
              disabled={isUpdatingStatus}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 text-red-900 border border-red-300 hover:bg-red-100 text-xs font-black transition-colors cursor-pointer"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
              <span>Escalate to State Directorate</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Notification Feedback Banner ─────────────────────────────────── */}
      {feedback && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in duration-200 ${
          feedback.type === 'error' ? 'bg-red-50 border-red-200 text-red-900' : 'bg-purple-50 border-purple-200 text-purple-900'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? <AlertTriangle className="w-4 h-4 text-red-600" /> : <CheckCircle2 className="w-4 h-4 text-purple-600" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-500 hover:text-slate-800">
            Dismiss
          </button>
        </div>
      )}

      {/* ── Oversight Notice Banner ──────────────────────────────────────── */}
      <div className="bg-purple-50 border border-purple-200 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-purple-950 uppercase tracking-wider">
                Administrative Oversight Record
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200/80 text-purple-900">
                Read-Only Clinical Dossier
              </span>
            </div>
            <p className="text-xs text-purple-900/80 font-medium mt-0.5">
              Administrators have management oversight. Clinical observations, sample collections, and treatments are recorded by attending field veterinarians.
            </p>
          </div>
        </div>

        <div className="text-xs text-purple-950 sm:text-right space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-purple-200">
          <p className="font-bold">Command Unit: Thane District HQ</p>
          <p className="text-[11px] text-purple-800">Surveillance Status: Official</p>
        </div>
      </div>

      {/* ── 1. CASE SUMMARY ──────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 pb-5 border-b border-slate-100">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                {caseData.id}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusBadge}`}>
                Status: {caseData.status}
              </span>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full border ${
                  caseData.riskLevel === 'CRITICAL'
                    ? 'bg-red-600 text-white border-red-700'
                    : caseData.riskLevel === 'HIGH'
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300 font-medium'
                }`}
              >
                Risk Tier: {caseData.riskLevel} ({caseData.riskScore || 85}/100)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">
              {caseData.species} · {caseData.farmerName}
            </h1>

            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {caseData.village}, {caseData.taluka || caseData.district}
              </span>
              <span className="text-slate-300">·</span>
              <span className="font-mono text-slate-500">
                GPS: {caseData.lat || caseData.latitude}° N, {caseData.lng || caseData.longitude}° E
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Reported: {new Date(caseData.reportedAt || caseData.createdAt).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </p>
          </div>

          {/* Quick Administrative Status Selector */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:w-80 space-y-2 shrink-0">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Change Administrative State
            </label>
            <div className="flex items-center gap-2">
              <select
                value={adminStatus}
                onChange={(e) => setAdminStatus(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
              >
                <option value="REPORTED">Reported (नोंदणीकृत)</option>
                <option value="UNDER_INVESTIGATION">Under Investigation (तपासणी सुरू)</option>
                <option value="SUSPECTED">Suspected Outbreak (संशयित)</option>
                <option value="CONFIRMED">Confirmed Disease (पुष्टी)</option>
                <option value="RESPONSE">Response Deployed (प्रतिबंधात्मक कृती)</option>
                <option value="MONITORING">Monitoring (निरीक्षणाखाली)</option>
                <option value="ESCALATED">Escalated to Directorate (उच्च स्तरावर वर्ग)</option>
                <option value="RESOLVED">Resolved / Closed (बंद)</option>
              </select>
              <button
                type="button"
                onClick={() => handleAdminStatusChange(adminStatus)}
                disabled={isUpdatingStatus}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-0.5">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Farmer Contact</span>
            <p className="font-bold text-slate-900">{caseData.farmerPhone || caseData.contact || '+91 91234 56789'}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-0.5">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Affected Animals</span>
            <p className="font-bold text-slate-900">{caseData.affectedAnimals || 1} head</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-0.5">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Mortality (Deaths)</span>
            <p className={`font-black ${(caseData.deaths || 0) > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {caseData.deaths || 0} dead
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-0.5">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Attending Veterinarian</span>
            <p className="font-bold text-purple-900 truncate">
              {caseData.assignedVet || caseData.assignedTo || 'Unassigned'}
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. ASSIGNMENT (ACTIONABLE) ──────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-extrabold text-slate-900">Assignment</h2>
          </div>
          <div className="flex items-center gap-2">
            {isAssigned ? (
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 text-xs font-bold transition-all cursor-pointer"
              >
                Reassign Veterinarian
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                Assign Veterinarian
              </button>
            )}
          </div>
        </div>

        {isAssigned ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Assigned To (Current Veterinarian)</span>
              <p className="font-black text-purple-950 text-sm mt-0.5">{caseData.assignedVet || caseData.assignedTo}</p>
              <p className="text-slate-500 font-medium">{caseData.assignedRole || 'Veterinary Officer'}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Assigned By</span>
              <p className="font-bold text-slate-900 mt-0.5">{caseData.assignedBy || 'District Command Administrator'}</p>
              <p className="text-slate-500">Thane District Command</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Assignment Date</span>
              <p className="font-mono font-bold text-slate-900 mt-0.5">
                {caseData.assignedAt ? new Date(caseData.assignedAt).toLocaleString('en-IN') : 'Recently Assigned'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>This case is currently unassigned. Please allocate an attending field veterinarian.</span>
            </div>
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              Assign Veterinarian
            </button>
          </div>
        )}
      </div>

      {/* ── 3. ORIGINAL FARMER COMPLAINT & SYMPTOMS ───────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-extrabold text-slate-900">Farmer Syndromic Statement &amp; Symptoms</h2>
        </div>

        {caseData.rawInput && (
          <blockquote className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 italic leading-relaxed">
            "{caseData.rawInput}"
          </blockquote>
        )}

        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Itemized Clinical Symptoms</span>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(caseData.symptoms) ? caseData.symptoms : [caseData.symptoms]).map((s, idx) => (
              <span key={idx} className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-xl border border-emerald-200">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. AI ANALYSIS (Decision Support) ────────────────────────────── */}
      {caseData.aiAnalysis && (
        <AIAnalysisResult
          data={{
            ...caseData.aiAnalysis,
            symptoms: (caseData.aiAnalysis?.symptoms && caseData.aiAnalysis.symptoms.length > 0)
              ? caseData.aiAnalysis.symptoms
              : (Array.isArray(caseData.symptoms) ? caseData.symptoms : (caseData.symptoms ? [caseData.symptoms] : [])),
          }}
        />
      )}

      {/* ── 5. CLINICAL INVESTIGATION FINDINGS (READ-ONLY) ───────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Clinical Findings &amp; Observations (Read-Only)</h2>
              <p className="text-[11px] text-slate-400">Submitted by attending field veterinarian</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
            <Lock className="w-3 h-3" /> Vet Authenticated
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">On-Site Findings</span>
            <p className="text-slate-800 leading-relaxed font-medium">
              {inv.findings || 'No physical findings recorded yet by attending officer.'}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Clinical Observations</span>
            <p className="text-slate-800 leading-relaxed font-medium">
              {inv.clinicalObservations || 'No clinical observations submitted yet.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── 6. LABORATORY / SAMPLE INFORMATION (READ-ONLY) ───────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-extrabold text-slate-900">Biological Specimen &amp; Laboratory Dockets (Read-Only)</h2>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
            <Lock className="w-3 h-3" /> Diagnostic Chain of Custody
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-slate-400 text-[10px] font-bold uppercase block">Sample Status</span>
            <p className="font-bold text-slate-900 mt-1">
              {inv.sampleCollected || caseData.labReferral ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Specimen Collected
                </span>
              ) : (
                <span className="text-slate-500">No Sample Collected</span>
              )}
            </p>
            {inv.sampleType && <p className="text-slate-600 mt-0.5">{inv.sampleType}</p>}
            {inv.sampleTubeId && <p className="font-mono text-slate-500 text-[11px] mt-0.5">Tube: {inv.sampleTubeId}</p>}
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-slate-400 text-[10px] font-bold uppercase block">Laboratory Referral</span>
            <p className="font-bold text-slate-900 mt-1">
              {inv.labReferral || caseData.labReferral ? (
                <span className="text-indigo-700 flex items-center gap-1">
                  <TestTube className="w-3.5 h-3.5" /> Referred for Testing
                </span>
              ) : (
                <span className="text-slate-500">No Laboratory Referral</span>
              )}
            </p>
            {inv.labName && <p className="text-slate-600 mt-0.5">{inv.labName}</p>}
            {inv.labReferralNumber && <p className="font-mono text-slate-500 text-[11px] mt-0.5">Docket: {inv.labReferralNumber}</p>}
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-slate-400 text-[10px] font-bold uppercase block">Laboratory Notes</span>
            <p className="text-slate-800 mt-1 font-medium">
              {caseData.labNotes || inv.notes || 'No supplementary diagnostic notes recorded.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── 7. TREATMENT & RESPONSE (READ-ONLY) ───────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-extrabold text-slate-900">Treatment &amp; Emergency Field Response (Read-Only)</h2>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
            <Lock className="w-3 h-3" /> Veterinary Prescription
          </span>
        </div>

        <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200 text-xs text-slate-800 leading-relaxed font-medium">
          {caseData.treatmentNotes || inv.treatmentTaken || 'No treatment regimen logged in system yet.'}
        </div>
      </div>

      {/* ── REASSIGNMENT MODAL ────────────────────────────────────────────── */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {isAssigned ? 'Reassign Attending Veterinarian' : 'Assign Field Veterinarian'}
                </h3>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Registered Veterinarian (Thane District)
                </label>
                <select
                  value={selectedVetId}
                  onChange={(e) => setSelectedVetId(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  {availableVets.map((v) => (
                    <option key={v._id || v.id} value={v._id || v.id}>
                      {v.name} · {v.designation || 'Veterinary Officer'} ({v.assignedArea || v.district || 'Thane'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-900">
                <p className="font-bold">Jurisdiction Handover Notice:</p>
                <p className="text-[11px] text-purple-800 mt-0.5">
                  The designated veterinarian will receive immediate case allocation in their dashboard and will have exclusive authorization to submit clinical findings.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isAssigning ? 'Dispatching...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
