import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Stethoscope,
  ShieldAlert,
  MapPin,
  Calendar,
  AlertTriangle,
  User,
  Activity,
  CheckCircle2,
  Save,
  FlaskConical,
  TestTube,
  Building2,
  Pill,
  FileText,
  Clock,
  Sparkles,
  Check,
  Send,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  BadgeCheck,
  Info,
} from 'lucide-react';
import { vetCaseService, VET_STATUS_OPTIONS } from '../data/mockVetData';
import { caseService } from '../services/caseService';
import { useAuth } from '../context/AuthContext';
import { AIAnalysisResult } from '../components/farmer/AIAnalysisResult';

export const VetCaseDetail = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Investigation form state
  const [selectedStatus, setSelectedStatus] = useState('UNDER_INVESTIGATION');
  const [findings, setFindings] = useState('');
  const [clinicalObservations, setClinicalObservations] = useState('');
  const [sampleCollected, setSampleCollected] = useState(false);
  const [sampleType, setSampleType] = useState('');
  const [sampleTubeId, setSampleTubeId] = useState('');
  const [labReferral, setLabReferral] = useState(false);
  const [labName, setLabName] = useState('');
  const [labReferralNumber, setLabReferralNumber] = useState('');
  const [treatmentTaken, setTreatmentTaken] = useState('');
  const [notes, setNotes] = useState('');

  // Notification feedback state
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadCase() {
      try {
        setErrorMessage(null);
        let loaded = await caseService.getCaseById(id);
        if (!loaded) {
          loaded = vetCaseService.getCaseById(id);
        }
        if (loaded && isMounted) {
          setCaseData(loaded);
          setSelectedStatus(loaded.status || 'UNDER_INVESTIGATION');

          const inv = loaded.investigation || {};
          setFindings(inv.findings || '');
          setClinicalObservations(inv.clinicalObservations || '');
          setSampleCollected(Boolean(inv.sampleCollected));
          setSampleType(inv.sampleType || '');
          setSampleTubeId(inv.sampleTubeId || '');
          setLabReferral(Boolean(inv.labReferral));
          setLabName(inv.labName || '');
          setLabReferralNumber(inv.labReferralNumber || '');
          setTreatmentTaken(inv.treatmentTaken || '');
          setNotes(inv.notes || '');
        }
      } catch (err) {
        console.error('Failed to load vet case:', err);
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to load case');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCase();
    return () => { isMounted = false; };
  }, [id]);

  const showNotification = (msg, type = 'success') => {
    setFeedbackMsg({ text: msg, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // ACTION: Save Findings
  const handleSaveFindings = async () => {
    if (!caseData) return;
    setIsSaving(true);

    const updatePayload = {
      status: selectedStatus,
      treatmentNotes: treatmentTaken || notes || findings || '',
      labReferral: Boolean(labReferral),
      labNotes: labName ? `${labName} (Ref: ${labReferralNumber || 'Pending'})` : (notes || ''),
      investigation: {
        findings,
        clinicalObservations,
        sampleCollected,
        sampleType,
        sampleTubeId,
        labReferral,
        labName,
        labReferralNumber,
        treatmentTaken,
        notes,
      },
    };

    const targetId = caseData.id || caseData._id;
    try {
      const updated = await caseService.updateCase(targetId, updatePayload) || vetCaseService.saveCaseInvestigation(targetId, updatePayload);

      if (updated) {
        setCaseData(updated);
        showNotification('Clinical investigation record saved successfully to surveillance network!');
      }
    } catch (err) {
      console.error('Failed to update investigation:', err);
      showNotification(`Failed to save record: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ACTION: Start Investigation
  const handleStartInvestigation = async () => {
    setSelectedStatus('UNDER_INVESTIGATION');
    const defaultFindings = findings || 'Field investigation commenced by attending veterinary officer.';
    if (!findings) {
      setFindings(defaultFindings);
    }
    const targetId = caseData.id || caseData._id;
    try {
      await caseService.updateCase(targetId, {
        status: 'UNDER_INVESTIGATION',
        treatmentNotes: defaultFindings,
      });
      vetCaseService.saveCaseInvestigation(targetId, {
        status: 'UNDER_INVESTIGATION',
      });
      setCaseData((prev) => ({ ...prev, status: 'UNDER_INVESTIGATION' }));
      showNotification('Case marked as UNDER INVESTIGATION on live server.');
    } catch (err) {
      console.error('Failed to start investigation:', err);
      showNotification('Marked investigation locally.', 'error');
    }
  };

  // ACTION: Quick Collect Sample
  const handleCollectSampleToggle = (checked) => {
    setSampleCollected(checked);
    if (checked && !sampleTubeId) {
      setSampleType('Vesicular fluid / Epithelial flap swab');
      setSampleTubeId(`TUBE-MH-${Date.now().toString().slice(-4)}`);
    }
  };

  // ACTION: Quick Refer to Lab
  const handleReferLabToggle = (checked) => {
    setLabReferral(checked);
    if (checked && !labName) {
      setLabName('State Disease Diagnostic Laboratory (SDDL), Pune');
      setLabReferralNumber(`REF-SDDL-2026-${Date.now().toString().slice(-4)}`);
    }
  };

  // ACTION: Record Treatment
  const handleQuickTreatmentPreset = () => {
    const defaultTx = 'Antipyretic/Analgesic injection (Meloxicam 15ml IM) + Broad-spectrum antibiotic coverage + Antiseptic 2% Potassium Permanganate footbath twice daily.';
    setTreatmentTaken(defaultTx);
    showNotification('Standard emergency supportive protocol added to treatment field.');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (errorMessage || !caseData) {
    const isAccessDenied = errorMessage && errorMessage.includes('Access Denied');
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        {isAccessDenied ? (
          <ShieldAlert className="w-14 h-14 text-red-500 mx-auto" />
        ) : (
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        )}
        <h2 className="text-xl font-bold text-slate-900">
          {isAccessDenied ? 'Restricted Access Case' : 'Case Record Not Found'}
        </h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          {errorMessage || `The requested Case ID #${id} was not found in the district registry.`}
        </p>
        <div className="pt-2">
          <Link
            to="/veterinarian/cases"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Assigned Cases
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusMeta = VET_STATUS_OPTIONS.find((s) => s.value === (caseData.status || selectedStatus)) || VET_STATUS_OPTIONS[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">

      {/* ── Breadcrumb & Top Bar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/veterinarian/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assigned Case Queue</span>
        </Link>

        {/* Action button bar */}
        <div className="flex items-center gap-2">
          {caseData.status !== 'UNDER_INVESTIGATION' && (
            <button
              type="button"
              onClick={handleStartInvestigation}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Start Investigation</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveFindings}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-black shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Findings'}</span>
          </button>
        </div>
      </div>

      {/* ── Notification Feedback Banner ─────────────────────────────────── */}
      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {/* ── ASSIGNMENT (INFORMATIONAL ONLY) ─────────────────────────────── */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <BadgeCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">Assignment</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                Assignment Status: Active Allocation
              </span>
            </div>
            <p className="text-xs text-emerald-900 font-semibold mt-0.5">
              Assigned To: <span className="font-extrabold">{caseData.assignedVet || user?.name || 'Veterinary Officer'}</span>
              {caseData.assignedRole && <span className="font-normal text-emerald-800"> ({caseData.assignedRole})</span>}
            </p>
          </div>
        </div>

        <div className="text-xs text-emerald-800 sm:text-right space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-100">
          <p className="text-[11px]">
            Assigned By: <span className="font-bold text-emerald-950">{caseData.assignedBy || 'District Command Administrator'}</span>
          </p>
          <p className="text-[11px] text-emerald-700">
            Assignment Date: <span className="font-mono font-semibold">{new Date(caseData.assignedAt || caseData.reportedAt || caseData.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </p>
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
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${currentStatusMeta.color}`}>
                Status: {currentStatusMeta.label}
              </span>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full border ${
                  caseData.riskLevel === 'CRITICAL'
                    ? 'bg-red-600 text-white border-red-700 shadow-2xs'
                    : caseData.riskLevel === 'HIGH'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
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
                {caseData.village}, {caseData.taluka}, {caseData.district}
              </span>
              <span className="text-slate-300">·</span>
              <span className="font-mono text-slate-500">
                Coords: {caseData.latitude}° N, {caseData.longitude}° E
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Reported on {new Date(caseData.reportedAt).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </p>
          </div>

          {/* 6. STATUS OPTIONS Dropdown Updater */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:w-80 space-y-2 shrink-0">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Surveillance Status (Official)
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
              >
                {VET_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleSaveFindings}
                className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                Update
              </button>
            </div>
            <span className="text-[10px] text-slate-400 block">
              Strictly restricted to 6 validated epidemiological state codes.
            </span>
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-0.5">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Farmer Contact</span>
            <p className="font-bold text-slate-900">{caseData.contact || '+91 91234 56789'}</p>
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
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Duration of Illness</span>
            <p className="font-bold text-slate-900">{caseData.duration || '1-2 days'}</p>
          </div>
        </div>
      </div>

      {/* ── 2. ORIGINAL FARMER COMPLAINT & SYMPTOMS ───────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-extrabold text-slate-900">Original Farmer Complaint &amp; Symptoms</h2>
          <span className="text-[10px] text-slate-400 ml-auto font-mono">Verbatim Record</span>
        </div>

        {(caseData.rawInput || caseData.originalFarmerReport) && (
          <blockquote className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 italic leading-relaxed">
            "{caseData.rawInput || caseData.originalFarmerReport}"
          </blockquote>
        )}

        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Itemized Clinical Symptoms</span>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(caseData.symptoms) ? caseData.symptoms : (caseData.symptoms ? [caseData.symptoms] : [])).map((s, idx) => (
              <span key={idx} className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-xl border border-emerald-200">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. AI-ASSISTED ANALYSIS (Decision Support) ────────────────────── */}
      <AIAnalysisResult
        data={{
          ...(caseData.aiAnalysis || {}),
          symptoms: (caseData.aiAnalysis?.symptoms && caseData.aiAnalysis.symptoms.length > 0)
            ? caseData.aiAnalysis.symptoms
            : (Array.isArray(caseData.symptoms) ? caseData.symptoms : (caseData.symptoms ? [caseData.symptoms] : [])),
          possibleConditions: caseData.aiAnalysis?.possibleConditions || [],
          recommendations: caseData.aiAnalysis?.recommendations || [],
          explanation: caseData.aiAnalysis?.explanation || '',
        }}
      />

      {/* ── 4. INVESTIGATION SECTION & ACTIONS ────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Veterinary Clinical Investigation Record
              </h2>
              <p className="text-xs text-slate-500">
                Record on-site findings, biological specimen collection, and treatment prescriptions
              </p>
            </div>
          </div>

          <span className="text-xs font-mono text-slate-400 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
            Attending Officer: {caseData.assignedVet || 'Dr. Anand Deshmukh'}
          </span>
        </div>

        {/* Investigation Form Fields */}
        <div className="space-y-5">
          
          {/* Field 1: Veterinarian Findings */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              Veterinarian Findings (शारीरिक तपासणी निष्कर्ष) <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="Enter physical examination findings — e.g. Ruptured oral vesicles on dental pad, bilateral interdigital ulcers, rectal temperature..."
              className="w-full p-3.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white leading-relaxed resize-none"
            />
          </div>

          {/* Field 2: Clinical Observations */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              Clinical Observations &amp; Vitals (वैद्यकीय निरीक्षणे)
            </label>
            <textarea
              rows={2}
              value={clinicalObservations}
              onChange={(e) => setClinicalObservations(e.target.value)}
              placeholder="Heart rate, respiratory auscultation, mucous membranes, rumen motility..."
              className="w-full p-3.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white leading-relaxed resize-none"
            />
          </div>

          {/* Field 3: Sample Collection Sub-Section */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sampleCollected}
                  onChange={(e) => handleCollectSampleToggle(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <TestTube className="w-4 h-4 text-emerald-600" />
                  Biological Sample Collected (नमुना संकलन)
                </span>
              </label>

              <button
                type="button"
                onClick={() => handleCollectSampleToggle(!sampleCollected)}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
              >
                {sampleCollected ? 'Clear Sample' : '+ Quick Collect Sample'}
              </button>
            </div>

            {sampleCollected && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Sample Type &amp; Transport Medium
                  </label>
                  <input
                    type="text"
                    value={sampleType}
                    onChange={(e) => setSampleType(e.target.value)}
                    placeholder="e.g. Vesicular fluid in phosphate-buffered glycerol"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Sample Tube / Barcode ID
                  </label>
                  <input
                    type="text"
                    value={sampleTubeId}
                    onChange={(e) => setSampleTubeId(e.target.value)}
                    placeholder="e.g. TUBE-MH-2026-FMD-8802"
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Field 4: Laboratory Referral Sub-Section */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={labReferral}
                  onChange={(e) => handleReferLabToggle(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Refer to Diagnostic Laboratory (प्रयोगशाळा संदर्भ)
                </span>
              </label>

              <button
                type="button"
                onClick={() => handleReferLabToggle(!labReferral)}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-800"
              >
                {labReferral ? 'Clear Referral' : '+ Refer to Lab'}
              </button>
            </div>

            {labReferral && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Designated Diagnostic Facility
                  </label>
                  <input
                    type="text"
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                    placeholder="e.g. State Disease Diagnostic Laboratory (SDDL), Pune"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Referral Docket / Dispatch Number
                  </label>
                  <input
                    type="text"
                    value={labReferralNumber}
                    onChange={(e) => setLabReferralNumber(e.target.value)}
                    placeholder="e.g. REF-SDDL-2026-7714"
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Field 5: Treatment / Action Taken */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Treatment &amp; Clinical Action Taken (औषधोपचार व कारवाई)
              </label>
              <button
                type="button"
                onClick={handleQuickTreatmentPreset}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
              >
                + Insert Standard Supportive Protocol
              </button>
            </div>
            <textarea
              rows={3}
              value={treatmentTaken}
              onChange={(e) => setTreatmentTaken(e.target.value)}
              placeholder="Prescribed medicines, dosages, topical antiseptics, quarantine instructions given to farmer..."
              className="w-full p-3.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white leading-relaxed resize-none"
            />
          </div>

          {/* Field 6: Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              Epidemiological Surveillance Notes (विशेष नोंदी)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Containment perimeter, neighbor holdings checked, follow-up inspection date..."
              className="w-full p-3.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white leading-relaxed resize-none"
            />
          </div>

        </div>

        {/* Bottom Action Buttons Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleCollectSampleToggle(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <TestTube className="w-3.5 h-3.5 text-slate-500" />
              <span>Collect Sample</span>
            </button>

            <button
              type="button"
              onClick={() => handleReferLabToggle(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Refer to Laboratory</span>
            </button>

            <button
              type="button"
              onClick={handleQuickTreatmentPreset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <Pill className="w-3.5 h-3.5 text-slate-500" />
              <span>Record Treatment</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveFindings}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs shadow-md shadow-emerald-200 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Investigation...' : 'Save & Update Record'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
