import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  MapPin,
  ChevronRight,
  ArrowRight,
  Calendar,
  Search,
  Filter,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { caseService } from '../services/caseService';
import { useFarmerLanguage } from '../context/FarmerLanguageContext';

export const FarmerCases = () => {
  const { user } = useAuth();
  const { t, language } = useFarmerLanguage();
  const farmerName = user?.name || 'Ramesh Patil';

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFarmerCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await caseService.getFarmerCases(user || farmerName);
      setCases(data);
    } catch (err) {
      console.error('Failed to load farmer cases:', err);
      setError(err.message || 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarmerCases();
  }, [user, farmerName]);

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
        return 'bg-red-50 text-red-700 border-red-200 font-bold';
      case 'HIGH':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
      case 'MODERATE':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200 font-semibold';
      case 'LOW':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium';
    }
  };

  const localeCode = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

  // Filter logic
  const filteredCases = cases.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (c.id && c.id.toLowerCase().includes(term)) ||
      (c.species && c.species.toLowerCase().includes(term)) ||
      (c.symptoms && Array.isArray(c.symptoms) && c.symptoms.some((s) => typeof s === 'string' && s.toLowerCase().includes(term))) ||
      (c.village && c.village.toLowerCase().includes(term));

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'ACTIVE'
        ? c.status !== 'RESOLVED'
        : c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1.5">
            <FileText className="w-4 h-4" />
            <span>PashuPrahari · {t('cases.pageTitle')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('cases.pageTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('cases.pageSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadFarmerCases}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            title={t('cases.refresh')}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('cases.refresh')}</span>
          </button>
          <Link
            to="/farmer/report"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-black shadow-md shadow-emerald-200 transition-all shrink-0 self-start sm:self-center cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('cases.reportNewIssue')}</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs flex items-center justify-between gap-2">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadFarmerCases}
            className="px-3 py-1 bg-red-600 text-white font-bold rounded-lg text-xs shrink-0 hover:bg-red-700 cursor-pointer"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {/* ── Search & Filter Bar ─────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('cases.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('cases.filterAll')} ({cases.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'ACTIVE' ? 'bg-white text-amber-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('cases.filterActive')}
          </button>
          <button
            onClick={() => setStatusFilter('RESOLVED')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'RESOLVED' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('cases.filterResolved')}
          </button>
        </div>
      </div>

      {/* ── Cases List Table / Cards ────────────────────────────────────── */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">{t('cases.loading')}</h3>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">{t('cases.noCasesFound')}</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {cases.length === 0
                ? t('cases.noReportsYet')
                : t('cases.noMatches')}
            </p>
            {cases.length === 0 && (
              <Link
                to="/farmer/report"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('cases.submitFirstReport')}</span>
              </Link>
            )}
          </div>
        ) : (
          filteredCases.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs hover:border-emerald-400 hover:shadow-sm transition-all space-y-4"
            >
              {/* Header row: Case ID, Species, Date, Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                    {item.id}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {item.species}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {t('cases.reportedOn')}: {item.reportedAt ? new Date(item.reportedAt).toLocaleDateString(localeCode, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }) : '—'}
                  </span>
                </div>

                {/* Status + Risk */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(item.status)}`}>
                    {getTranslatedStatus(item.status)}
                  </span>
                  {item.riskLevel && (
                    <span className={`text-[11px] px-2.5 py-1 rounded-full border ${getRiskBadge(item.riskLevel)}`}>
                      {t('cases.risk')}: {item.riskLevel}
                    </span>
                  )}
                </div>
              </div>

              {/* Symptoms & Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-600 block mb-1.5">{t('cases.reportedSymptoms')}:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.symptoms && Array.isArray(item.symptoms) && item.symptoms.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg font-medium text-[11px]">
                        {typeof s === 'string' ? s : s?.name || JSON.stringify(s)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 sm:text-right text-slate-600">
                  <p>
                    {t('cases.animalsAffected')}: <strong className="text-slate-900">{item.affectedAnimals || 1}</strong>
                  </p>
                  <p>
                    {t('cases.location')}: <strong className="text-slate-900">{item.village}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {t('cases.lastUpdated')}: {item.lastUpdatedAt ? new Date(item.lastUpdatedAt).toLocaleString(localeCode) : '—'}
                  </p>
                </div>
              </div>

              {/* Footer action bar */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs text-slate-600">
                  <strong className="text-slate-800">{t('cases.latestUpdate')}: </strong>
                  {item.latestUpdate || getTranslatedStatus(item.status)}
                </p>

                {/* Link to Case Details & Timeline */}
                <Link
                  to={`/farmer/cases/${item.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs self-start sm:self-center transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{t('cases.viewTimelineAndDetails')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
