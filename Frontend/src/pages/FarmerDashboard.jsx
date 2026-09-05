import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Stethoscope,
  Activity,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Calendar,
  Sparkles,
  ChevronRight,
  PhoneCall,
  Info,
  BadgeCheck,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { caseService } from '../services/caseService';
import { MOCK_FARMER_NOTIFICATIONS } from '../data/mockFarmerData';
import { useFarmerLanguage } from '../context/FarmerLanguageContext';

export const FarmerDashboard = () => {
  const { user } = useAuth();
  const { t, language } = useFarmerLanguage();
  const farmerName = user?.name || 'Ramesh Patil';

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFarmerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const farmerCases = await caseService.getFarmerCases(user || farmerName);
      setCases(farmerCases);
    } catch (err) {
      console.error('Failed to load farmer cases:', err);
      setError(err.message || 'Failed to retrieve cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarmerData();
  }, [user, farmerName]);

  const stats = useMemo(() => {
    const totalReports = cases.length;
    const activeCases = cases.filter((c) => (c.status || '').toUpperCase() !== 'RESOLVED').length;
    const underInvestigation = cases.filter((c) => (c.status || '').toUpperCase().includes('INVESTIGATION')).length;
    const resolved = cases.filter((c) => (c.status || '').toUpperCase() === 'RESOLVED').length;
    return { totalReports, activeCases, underInvestigation, resolved };
  }, [cases]);

  const notifications = MOCK_FARMER_NOTIFICATIONS;

  const localeCode = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

  const getStatusBadge = (status) => {
    const st = (status || '').toUpperCase().replace(/\s+/g, '_');
    switch (st) {
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

  const getTranslatedStatus = (status) => {
    const key = (status || '').toUpperCase().replace(/\s+/g, '_');
    const translated = t(`statusLabels.${key}`);
    return translated !== `statusLabels.${key}` ? translated : status;
  };

  const getRiskBadge = (riskLevel) => {
    const r = (riskLevel || '').toUpperCase();
    switch (r) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200 font-black';
      case 'HIGH':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
      case 'MODERATE':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200 font-semibold';
      case 'LOW':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">

      {/* ── 1. Greeting Banner ─────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-xs font-bold text-green-800">
              <BadgeCheck className="w-3.5 h-3.5 text-green-600" />
              <span>{t('dashboard.verifiedOwner', { village: user?.village || 'Thane Rural' })}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('dashboard.greeting', { name: farmerName })}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 max-w-lg">
              {t('dashboard.welcomeSubtitle')}
            </p>
          </div>

          {/* ── 2. Quick Action: Report Animal Health Issue ──────────────── */}
          <Link
            to="/farmer/report"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm shadow-md shadow-emerald-200 transition-all shrink-0 hover:scale-[1.02] cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{t('dashboard.reportHealthIssue')}</span>
          </Link>
        </div>
      </div>

      {/* ── 3. Statistics Cards (4 Key Metrics) ─────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        {/* Metric 1: Total Reports */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.totalReports')}</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <FileText className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{stats.totalReports}</p>
          <span className="text-[10px] text-slate-400 mt-0.5">{t('dashboard.submittedByYou')}</span>
        </div>

        {/* Metric 2: Active Cases */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">{t('dashboard.activeCases')}</span>
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Activity className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-2">{stats.activeCases}</p>
          <span className="text-[10px] text-amber-700 font-semibold mt-0.5">{t('dashboard.openAndMonitored')}</span>
        </div>

        {/* Metric 3: Under Investigation */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">{t('dashboard.investigating')}</span>
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
              <Stethoscope className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-700 mt-2">{stats.underInvestigation}</p>
          <span className="text-[10px] text-blue-700 font-semibold mt-0.5">{t('dashboard.assignedToVet')}</span>
        </div>

        {/* Metric 4: Resolved */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">{t('dashboard.resolved')}</span>
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2">{stats.resolved}</p>
          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">{t('dashboard.recoveredAnimals')}</span>
        </div>

      </div>

      {/* ── 4. Recent Reports Section ───────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">{t('dashboard.recentReports')}</h2>
            <p className="text-xs text-slate-500">{t('dashboard.liveSurveillanceStatus')}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadFarmerData}
              disabled={loading}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
              title={t('dashboard.refreshReports')}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/farmer/cases"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              <span>{t('cases.pageTitle')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs flex items-center justify-between gap-2">
            <span>{error}</span>
            <button
              type="button"
              onClick={loadFarmerData}
              className="px-2.5 py-1 bg-red-600 text-white font-bold rounded-lg text-[11px] shrink-0 hover:bg-red-700 cursor-pointer"
            >
              {t('common.retry')}
            </button>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center space-y-2">
            <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">{t('dashboard.fetchingRecords')}</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="p-8 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">{t('dashboard.noReportsYet')}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t('dashboard.noReportsSubtitle')}
            </p>
            <Link
              to="/farmer/report"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('dashboard.reportFirstIssue')}</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            {cases.slice(0, 5).map((c) => (
              <div
                key={c.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-slate-50/40 hover:bg-white hover:border-emerald-300 hover:shadow-xs transition-all space-y-3"
              >
                {/* Card Top Row: Case ID, Species, Date, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                      {c.id}
                    </span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {c.species}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {c.reportedAt ? new Date(c.reportedAt).toLocaleDateString(localeCode, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      }) : '—'}
                    </span>
                  </div>

                  {/* Status + Risk badges */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border font-bold ${getStatusBadge(c.status)}`}>
                      {getTranslatedStatus(c.status)}
                    </span>

                    {c.riskLevel && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border ${getRiskBadge(c.riskLevel)}`}>
                        {t('cases.risk')}: {c.riskLevel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Symptoms Short Summary */}
                <div className="space-y-1 text-xs">
                  <span className="text-slate-500 font-semibold">{t('cases.reportedSymptoms')}:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {c.symptoms && Array.isArray(c.symptoms) && c.symptoms.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 text-[11px] font-medium"
                      >
                        {typeof s === 'string' ? s : s?.name || JSON.stringify(s)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Latest update / Assigned Vet */}
                <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <p className="text-slate-600">
                    <strong className="text-slate-800">{t('dashboard.statusUpdate')}: </strong>
                    {c.latestUpdate || getTranslatedStatus(c.status)}
                  </p>
                  {c.assignedVet && (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 shrink-0">
                      <Stethoscope className="w-3.5 h-3.5" />
                      {c.assignedVet}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Cases Button */}
        {cases.length > 0 && (
          <div className="pt-2 text-center">
            <Link
              to="/farmer/cases"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
            >
              <span>{t('dashboard.viewAllReports', { count: cases.length })}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

      </div>

      {/* ── 5. Notifications Section ────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{t('dashboard.officialNotifications')}</h2>
              <p className="text-xs text-slate-500">{t('dashboard.notificationsSubtitle')}</p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {t('dashboard.alertsCount', { count: notifications.length })}
          </span>
        </div>

        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors ${
                notif.isNew
                  ? 'bg-amber-50/40 border-amber-200 ring-1 ring-amber-100'
                  : 'bg-slate-50/60 border-slate-200'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                {notif.type === 'VET_ASSIGNED' ? (
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                ) : notif.type === 'ADVISORY' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                ) : (
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                )}
              </div>

              <div className="flex-1 space-y-1 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                    {notif.timestamp}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {notif.message}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ── Helpline Card ──────────────────────────────────────────────── */}
      <div className="bg-emerald-900 text-white rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold">{t('dashboard.helplineTitle')}</h3>
            <p className="text-xs text-emerald-200">{t('dashboard.helplineSubtitle')}</p>
          </div>
        </div>
        <a
          href="tel:18001801551"
          className="self-start sm:self-center px-4 py-2 rounded-xl bg-white text-emerald-950 hover:bg-emerald-100 text-xs font-black shadow-xs transition-colors"
        >
          {t('dashboard.callHelpline')}
        </a>
      </div>

    </div>
  );
};
