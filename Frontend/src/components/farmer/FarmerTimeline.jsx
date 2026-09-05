import React from 'react';
import {
  Check,
  Activity,
  Circle,
  Clock,
  CheckCircle2,
  FileCheck,
  Building2,
  Stethoscope,
  HeartPulse,
  Sparkles,
} from 'lucide-react';
import { useFarmerLanguage } from '../../context/FarmerLanguageContext';

/**
 * Standard 7-Step Farmer Incident Lifecycle Sequence
 */
export const FARMER_TIMELINE_STEPS = [
  {
    key: 'SUBMITTED',
    titleKey: 'timeline.submitted',
    descKey: 'timeline.submittedDesc',
    icon: FileCheck,
  },
  {
    key: 'AI_ASSESSMENT',
    titleKey: 'timeline.aiAssessment',
    descKey: 'timeline.aiAssessmentDesc',
    icon: Sparkles,
  },
  {
    key: 'DEPT_RECEIVED',
    titleKey: 'timeline.deptReview',
    descKey: 'timeline.deptReviewDesc',
    icon: Building2,
  },
  {
    key: 'VET_ASSIGNED',
    titleKey: 'timeline.vetAssigned',
    descKey: 'timeline.vetAssignedDesc',
    icon: Stethoscope,
  },
  {
    key: 'INVESTIGATION_STARTED',
    titleKey: 'timeline.investigationStarted',
    descKey: 'timeline.investigationStartedDesc',
    icon: Activity,
  },
  {
    key: 'MONITORING',
    titleKey: 'timeline.monitoring',
    descKey: 'timeline.monitoringDesc',
    icon: HeartPulse,
  },
  {
    key: 'RESOLVED',
    titleKey: 'timeline.resolved',
    descKey: 'timeline.resolvedDesc',
    icon: CheckCircle2,
  },
];

/**
 * Maps standard case status to 7-step timeline progress index (0 to 6)
 */
export const getProgressStepIndex = (status) => {
  switch (status) {
    case 'RESOLVED':
      return 6;
    case 'MONITORING':
      return 5;
    case 'UNDER_INVESTIGATION':
    case 'INVESTIGATING':
    case 'RESPONSE':
      return 4;
    case 'ASSIGNED':
      return 3;
    case 'SUSPECTED':
    case 'CONFIRMED':
    case 'DEPT_RECEIVED':
      return 2;
    case 'AI_ASSESSED':
      return 1;
    case 'REPORTED':
    case 'SUBMITTED':
    default:
      return 0;
  }
};

export const FarmerTimeline = ({ currentStatus = 'UNDER_INVESTIGATION', customStepDetails = {} }) => {
  const { t } = useFarmerLanguage();
  const activeStepIdx = getProgressStepIndex(currentStatus);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      
      {/* ── Section Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            {t('caseDetail.timelineTitle')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('caseDetail.timelineSubtitle')}
          </p>
        </div>

        <span className="text-[11px] font-bold px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full self-start sm:self-center">
          {t('caseDetail.stepActive', { step: Math.min(activeStepIdx + 1, 7) })}
        </span>
      </div>

      {/* ── 7-Step Vertical Stepper ─────────────────────────────────────── */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {FARMER_TIMELINE_STEPS.map((step, idx) => {
          const isCompleted = idx < activeStepIdx || (idx === 6 && activeStepIdx === 6);
          const isCurrent = idx === activeStepIdx && activeStepIdx !== 6;
          const isUpcoming = idx > activeStepIdx;

          const StepIcon = step.icon;
          const detailText = customStepDetails[step.key] || t(step.descKey);

          return (
            <div key={step.key} className="relative group">
              
              {/* Step Circle Pin */}
              <div
                className={`absolute -left-6 sm:-left-8 top-0.5 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                    : 'bg-white border-2 border-slate-300 text-slate-300'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[3]" />
                ) : isCurrent ? (
                  <StepIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                ) : (
                  <Circle className="w-2.5 h-2.5 fill-slate-300 text-slate-300" />
                )}
              </div>

              {/* Step Content */}
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3
                    className={`text-xs sm:text-sm font-extrabold ${
                      isCompleted
                        ? 'text-slate-900'
                        : isCurrent
                        ? 'text-blue-900'
                        : 'text-slate-400 font-semibold'
                    }`}
                  >
                    {t(step.titleKey)}
                  </h3>

                  <span
                    className={`text-[11px] font-bold ${
                      isCompleted
                        ? 'text-emerald-700'
                        : isCurrent
                        ? 'text-blue-600'
                        : 'text-slate-400 font-medium'
                    }`}
                  >
                    {isCompleted
                      ? t('caseDetail.completed')
                      : isCurrent
                      ? t('caseDetail.inProgress')
                      : t('caseDetail.nextStep')}
                  </span>
                </div>

                <p
                  className={`text-xs leading-relaxed ${
                    isCurrent
                      ? 'text-blue-950 font-medium'
                      : isCompleted
                      ? 'text-slate-600'
                      : 'text-slate-400'
                  }`}
                >
                  {detailText}
                </p>
              </div>

            </div>
          );
        })}
      </div>

      {/* ── Helpful Note for Farmer ─────────────────────────────────────── */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-900">
        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong className="font-bold">{t('caseDetail.farmerHelpNoteTitle')} </strong>
          {t('caseDetail.farmerHelpNote')}
        </p>
      </div>

    </div>
  );
};
