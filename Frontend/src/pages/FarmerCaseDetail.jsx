import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Stethoscope,
  Activity,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Check,
  Circle,
  MessageSquare,
  BadgeAlert,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { caseService } from '../services/caseService';
import { getFarmerCaseById } from '../data/mockFarmerData';
import { FarmerTimeline } from '../components/farmer/FarmerTimeline';
import { useFarmerLanguage } from '../context/FarmerLanguageContext';

export const FarmerCaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useFarmerLanguage();
  const farmerName = user?.name || 'Ramesh Patil';

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const found = await caseService.getCaseById(id);
      const fallback = getFarmerCaseById(farmerName, id);
      setCaseData(found || fallback);
    } catch (err) {
      console.error('Failed to load case detail:', err);
      const fallback = getFarmerCaseById(farmerName, id);
      if (fallback) {
        setCaseData(fallback);
      } else {
        setError(err.message || 'Failed to retrieve case record');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id, farmerName]);

  const localeCode = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

  const getTranslatedStatus = (status) => {
    const key = (status || '').toUpperCase().replace(/\s+/g, '_');
    const translated = t(`statusLabels.${key}`);
    return translated !== `statusLabels.${key}` ? translated : status;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'UNDER_INVESTIGATION':
      case 'INVESTIGATING':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'REPORTED':
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-4">
        <Clock className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
        <h2 className="text-base font-bold text-slate-800">{t('caseDetail.retrievingDetails')}</h2>
        <p className="text-xs text-slate-500">{t('caseDetail.retrievingSubtext')}</p>
      </div>
    );
  }

  if (error && !caseData) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">{t('caseDetail.failedToLoad')}</h2>
        <p className="text-xs text-red-600 max-w-sm mx-auto">{error}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={fetchDetail}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {t('common.retry')}
          </button>
          <Link
            to="/farmer/cases"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            {t('caseDetail.backToReports')}
          </Link>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
        <FileText className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">{t('caseDetail.caseNotFound')}</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {t('caseDetail.caseNotFoundDesc')}
        </p>
        <Link
          to="/farmer/cases"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('caseDetail.backToReports')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">

      {/* ── Breadcrumb Navigation ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          to="/farmer/cases"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('caseDetail.backToReports')}</span>
        </Link>
        <span className="text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          {t('caseDetail.caseRecord')} #{caseData.id}
        </span>
      </div>

      {/* ── Case Header & Current Status ─────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                {caseData.id}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadge(caseData.status)}`}>
                {getTranslatedStatus(caseData.status)}
              </span>
              {caseData.riskLevel && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {t('caseDetail.priority')}: {caseData.riskLevel}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-black text-slate-900 tracking-tight pt-1">
              {caseData.species} · {t('caseDetail.caseDetailsTitle')}
            </h1>

            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{caseData.village}{caseData.taluka ? `, ${caseData.taluka}` : ''}{caseData.district ? `, ${caseData.district}` : ''}</span>
              <span className="text-slate-300">·</span>
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('caseDetail.reportedOn')} {caseData.reportedAt ? new Date(caseData.reportedAt).toLocaleDateString(localeCode, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }) : '—'}</span>
            </p>
          </div>

          {/* Status of Veterinarian Allocation (Clean Farmer-Facing Status) */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:max-w-xs w-full space-y-1 text-xs shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('caseDetail.assignmentStatus')}
            </span>
            {caseData.assignedVet || caseData.assignedVetId || caseData.assignedTo ? (
              <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('caseDetail.vetAssigned')}</span>
              </p>
            ) : (
              <p className="text-amber-800 font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{t('caseDetail.pendingAssignment')}</span>
              </p>
            )}
            <p className="text-[11px] text-slate-500 pt-0.5">
              {caseData.assignedVet || caseData.assignedVetId || caseData.assignedTo
                ? t('caseDetail.vetAssignedDesc')
                : t('caseDetail.pendingAssignmentDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Case Details & Original Complaint ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: Original Complaint */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">{t('caseDetail.originalComplaintTranscript')}</h2>
          </div>
          <blockquote className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 italic leading-relaxed">
            "{caseData.rawComplaint || caseData.rawInput || caseData.symptoms?.[0] || t('caseDetail.noTranscript')}"
          </blockquote>

          <div className="space-y-1 pt-1 text-xs">
            <span className="font-bold text-slate-600 block">{t('caseDetail.identifiedSymptoms')}:</span>
            <div className="flex flex-wrap gap-1.5">
              {caseData.symptoms && Array.isArray(caseData.symptoms) && caseData.symptoms.map((sym, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]"
                >
                  {typeof sym === 'string' ? sym : sym?.name || JSON.stringify(sym)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Animal & Location Details */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">{t('caseDetail.animalAndHerdDetails')}</h2>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">{t('caseDetail.species')}:</span>
              <span className="font-bold text-slate-900">{caseData.species}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">{t('cases.animalsAffected')}:</span>
              <span className="font-bold text-slate-900">{caseData.affectedAnimals || 1}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">{t('caseDetail.durationOfSymptoms')}:</span>
              <span className="font-semibold text-slate-800">{caseData.duration || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">{t('caseDetail.vaccinationStatus')}:</span>
              <span className="font-semibold text-slate-800">{caseData.vaccinationStatus || '—'}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-slate-500">{t('caseDetail.location')}:</span>
              <span className="font-bold text-slate-900">{caseData.village}{caseData.district ? `, ${caseData.district}` : ''}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── 7-Step Lifecycle Case Progress Timeline ────────────────────── */}
      <FarmerTimeline currentStatus={caseData.status} />

    </div>
  );
};
