import React, { useState } from 'react';
import { FarmerForm } from '../components/farmer/FarmerForm';
import { ReportSuccessCard } from '../components/farmer/ReportSuccessCard';
import { ShieldCheck } from 'lucide-react';
import { APP_NAME_DEVANAGARI } from '../utils/constants';
import { useFarmerLanguage } from '../context/FarmerLanguageContext';

export const FarmerReport = () => {
  const { t } = useFarmerLanguage();
  const [submittedData, setSubmittedData] = useState(null);

  const handleSuccess = (data) => {
    setSubmittedData(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSubmittedData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-16">

      {/* ── Identity + Page Heading ─────────────────────────────────────── */}
      <div className="bg-white border border-green-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Green accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-green-600 via-emerald-500 to-green-600" />

        <div className="px-6 py-5 sm:px-8 sm:py-6 flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Left: branding + heading */}
          <div className="flex-1 space-y-2">
            {/* Brand chip */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-xs font-semibold text-green-800 tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              {APP_NAME_DEVANAGARI} · PashuPrahari
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {t('report.header.title')}
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed max-w-md">
              {t('report.header.subtitle')}
            </p>
          </div>

          {/* Right: surveillance badge */}
          <div className="shrink-0 self-start sm:self-center flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3.5 py-2.5 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600" />
            </span>
            <div>
              <p className="font-bold text-green-900">{t('report.header.surveillanceActive')}</p>
              <p className="text-green-700">{t('report.header.surveillanceSubtext')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      {submittedData ? (
        <ReportSuccessCard reportData={submittedData} onReset={handleReset} />
      ) : (
        <FarmerForm onSubmitSuccess={handleSuccess} />
      )}
    </div>
  );
};
