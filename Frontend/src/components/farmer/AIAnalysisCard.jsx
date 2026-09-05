import React from 'react';
import { Sparkles, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { AI_UI_STATES } from '../../utils/aiStateMachine';
import { AIAnalysisResult } from './AIAnalysisResult';
import { useFarmerLanguage } from '../../context/FarmerLanguageContext';

/**
 * AIAnalysisCard — Container coordinating loading, error, and result states
 */
export const AIAnalysisCard = ({
  aiState,
  analysisData,
  errorMessage,
  onRetry,
}) => {
  const { t } = useFarmerLanguage();

  if (aiState === AI_UI_STATES.IDLE || aiState === AI_UI_STATES.LISTENING) {
    return null;
  }

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300">
      {/* STATE: ANALYZING */}
      {aiState === AI_UI_STATES.ANALYZING && (
        <div className="bg-linear-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-600/20">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" />
                  {t('report.ai.aiAssistedAnalysis')}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {t('report.submit.analyzingAi')}
              </h3>
              <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div className="bg-emerald-600 h-full w-2/3 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE: ANALYSIS_ERROR */}
      {aiState === AI_UI_STATES.ANALYSIS_ERROR && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-300 flex items-center justify-center text-red-600 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-bold text-red-950">
                {t('report.submit.submissionError')}
              </h3>
              <p className="text-xs text-red-800 leading-relaxed">
                {errorMessage || t('report.location.error')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-red-200">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t('common.retry')}
            </button>
          </div>
        </div>
      )}

      {/* STATE: ANALYSIS_SUCCESS */}
      {aiState === AI_UI_STATES.ANALYSIS_SUCCESS && analysisData && (
        <AIAnalysisResult data={analysisData} />
      )}
    </div>
  );
};
