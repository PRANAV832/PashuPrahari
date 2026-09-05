import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useFarmerLanguage } from '../../context/FarmerLanguageContext';

/**
 * RecommendationList — Renders actionable guidance items with distinct visual separation.
 */
export const RecommendationList = ({ recommendations = [] }) => {
  const { t } = useFarmerLanguage();

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2.5">
      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
        {t('report.ai.recommendations')}
      </h4>

      <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5 text-[10px] font-bold">
              {idx + 1}
            </span>
            <span className="flex-1">{rec}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
