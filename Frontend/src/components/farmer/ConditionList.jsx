import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useFarmerLanguage } from '../../context/FarmerLanguageContext';

/**
 * ConditionList — Renders neutral informational cards for potential syndromic conditions.
 */
export const ConditionList = ({ conditions = [] }) => {
  const { t } = useFarmerLanguage();

  if (!conditions || conditions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          {t('report.ai.possibleConditions')}
        </h4>
        <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
          {t('report.ai.aiAssistedAnalysis')}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {conditions.map((item, idx) => {
          const name =
            typeof item === 'string'
              ? item
              : item?.name || item?.condition || '';
          const likelihood = typeof item === 'object' ? item?.likelihood : null;
          const note =
            typeof item === 'object'
              ? item?.note || item?.urgency
              : t('report.ai.defaultConditionNote');

          return (
            <div
              key={idx}
              className="p-3.5 bg-amber-50/40 border border-amber-200/80 rounded-xl space-y-1.5 hover:bg-amber-50/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-bold text-slate-900 leading-snug">
                  {name}
                </p>
                {likelihood && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-white border border-amber-200 text-amber-900 rounded-md shrink-0">
                    {likelihood}
                  </span>
                )}
              </div>

              {note && (
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {note}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
