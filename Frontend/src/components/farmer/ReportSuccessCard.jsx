import React from 'react';
import { CheckCircle2, ArrowLeft, ShieldCheck, Code, MapPin } from 'lucide-react';
import { useFarmerLanguage } from '../../context/FarmerLanguageContext';

export const ReportSuccessCard = ({ reportData, onReset }) => {
  const { t } = useFarmerLanguage();

  return (
    <div className="bg-white border border-green-200 rounded-2xl shadow-sm overflow-hidden space-y-0">

      {/* ── Green accent bar ─────────────────────────────────────────── */}
      <div className="h-1.5 bg-gradient-to-r from-green-600 via-emerald-400 to-green-600" />

      {/* ── Success banner ───────────────────────────────────────────── */}
      <div className="flex flex-col items-center text-center px-6 py-8 sm:px-10 space-y-3 border-b border-slate-100">
        <div className="w-16 h-16 rounded-full bg-green-100 border-4 border-green-50 flex items-center justify-center text-green-600 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {t('report.submit.reportSubmitted')}
          </h2>
          <p className="mt-1.5 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            {t('report.submit.reportSubmittedSubtitle')}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          {t('report.submit.surveillanceReady')}
        </span>
      </div>

      {/* ── Report Summary ───────────────────────────────────────────── */}
      <div className="px-6 py-5 sm:px-8 space-y-4 border-b border-slate-100">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('report.submit.reportSummary')}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SummaryField label={t('report.farmerDetails.fullName')} value={reportData.farmerName} />
          <SummaryField label={t('report.livestockDetails.animalSpecies')} value={reportData.species} />
          <SummaryField
            label={t('report.livestockDetails.animalsAffected')}
            value={`${reportData.affectedAnimals} ${t('report.submit.affected')} · ${reportData.deaths} ${t('report.submit.deceased')}`}
            valueClass={reportData.deaths > 0 ? 'text-red-700' : undefined}
          />
          <SummaryField
            label={t('report.livestockDetails.durationOfIllness')}
            value={`${reportData.duration} · ${reportData.vaccinationStatus}`}
          />

          {/* Original Complaint Transcript */}
          <div className="sm:col-span-2">
            <span className="block text-xs font-medium text-slate-500 mb-1">
              {t('report.symptoms.prompt')}
            </span>
            <p className="text-sm text-slate-800 leading-relaxed bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-3 italic">
              "{reportData.rawInput || reportData.rawComplaint || (typeof reportData.symptoms === 'string' ? reportData.symptoms : (Array.isArray(reportData.symptoms) ? reportData.symptoms.join(', ') : ''))}"
            </p>
          </div>

          {/* Identified Clinical Symptoms Badges */}
          {Array.isArray(reportData.symptoms) && reportData.symptoms.length > 0 && (
            <div className="sm:col-span-2 space-y-1.5">
              <span className="block text-xs font-semibold text-slate-700">
                {t('report.ai.detectedSymptoms') || 'Identified Symptoms'}:
              </span>
              <div className="flex flex-wrap gap-2">
                {reportData.symptoms.map((sym, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold shadow-2xs"
                  >
                    {typeof sym === 'string' ? sym : sym?.name || JSON.stringify(sym)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* GPS */}
          <div className="sm:col-span-2">
            <span className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-green-600" />
              {t('report.location.title')}
            </span>
            <span className="text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg block">
              {t('report.location.latitude')}: {reportData.latitude ?? '—'} &nbsp;|&nbsp; {t('report.location.longitude')}: {reportData.longitude ?? '—'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Dev Payload Preview ──────────────────────────────────────── */}
      <div className="bg-slate-900 text-slate-100 mx-6 sm:mx-8 my-5 rounded-xl overflow-hidden shadow-inner">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800">
          <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
            <Code className="w-3.5 h-3.5" />
            Structured Payload · Development Inspection
          </span>
          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Frontend Object</span>
        </div>
        <pre className="text-xs font-mono text-emerald-300 px-4 py-3 overflow-x-auto leading-relaxed">
          {JSON.stringify(reportData, null, 2)}
        </pre>
      </div>

      {/* ── Action ───────────────────────────────────────────────────── */}
      <div className="px-6 pb-6 sm:px-8 flex justify-center">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold rounded-xl transition-colors shadow-sm shadow-green-600/20 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('report.submit.reportAnotherCase')}
        </button>
      </div>
    </div>
  );
};

/* Small labelled summary field */
const SummaryField = ({ label, value, valueClass = '' }) => (
  <div>
    <span className="block text-xs font-medium text-slate-500 mb-0.5">{label}</span>
    <span className={`text-sm font-semibold text-slate-800 ${valueClass}`}>{value}</span>
  </div>
);
