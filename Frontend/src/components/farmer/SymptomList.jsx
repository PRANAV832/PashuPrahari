import React from 'react';
import { Stethoscope } from 'lucide-react';
import { useFarmerLanguage } from '../../context/FarmerLanguageContext';

/**
 * SymptomList — Renders compact, easily scannable symptom chips
 */
export const SymptomList = ({ symptoms = [] }) => {
  const { t } = useFarmerLanguage();

  if (!symptoms || symptoms.length === 0) {
    return (
      <p className="text-xs text-slate-500 italic">No specific symptoms extracted.</p>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
          {t('report.ai.detectedSymptoms')}
        </h4>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
          {symptoms.length} identified
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {symptoms.map((item, idx) => {
          const name = typeof item === 'string' ? item : item?.name || item?.label || '';
          const severity = typeof item === 'object' ? item?.severity : null;

          return (
            <div
              key={idx}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  severity === 'Critical'
                    ? 'bg-red-500 animate-pulse'
                    : severity === 'High'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />
              <span>{name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
