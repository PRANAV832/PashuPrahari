import React from 'react';
import { Sparkles, CheckCircle2, FileText, Info } from 'lucide-react';
import { SymptomList } from './SymptomList';
import { ConditionList } from './ConditionList';
import { RecommendationList } from './RecommendationList';
import { useFarmerLanguage } from '../../context/FarmerLanguageContext';

/**
 * AIAnalysisResult — Main AI Results Presentation Component
 */
export const AIAnalysisResult = ({ data }) => {
  const { t } = useFarmerLanguage();
  if (!data) return null;

  // Normalize data keys to guarantee resilience with backend payload shapes
  const symptoms = data.symptoms || data.detectedSymptoms || [];
  const possibleConditions =
    data.possibleConditions || data.conditions || [];
  const recommendations = data.recommendations || [];
  const explanation = data.explanation || '';
  const disclaimer = data.disclaimer || t('report.ai.disclaimer');

  return (
    <div className="bg-white border border-emerald-200 rounded-2xl shadow-xs overflow-hidden transition-all duration-200">
      {/* Top Emerald Accent Line */}
      <div className="h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600" />

      {/* Section Header: AI-Assisted Analysis */}
      <div className="px-5 py-4 bg-emerald-50/60 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {t('report.ai.aiAssistedAnalysis')}
              </h3>
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                {t('report.ai.decisionSupport')}
              </span>
            </div>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-white border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          {t('common.success')}
        </span>
      </div>

      {/* Content Sections */}
      <div className="p-5 sm:p-6 space-y-5">
        {/* 1. Detected Symptoms */}
        <SymptomList symptoms={symptoms} />

        {/* 2. Possible Conditions (AI Suggestions) */}
        <ConditionList conditions={possibleConditions} />

        {/* 3. Recommendations */}
        <RecommendationList recommendations={recommendations} />

        {/* 4. Clinical Context / Explanation (if provided) */}
        {explanation && (
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              {t('report.ai.explanation')}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {explanation}
            </p>
          </div>
        )}

        {/* 5. Mandatory Medical & Decision-Support Disclaimer */}
        <div className="p-3.5 bg-amber-50/50 border border-amber-200/70 rounded-xl flex items-start gap-2.5 text-xs text-slate-700">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px] text-slate-600">
            {disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};
