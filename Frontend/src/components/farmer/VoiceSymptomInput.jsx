import React, { useEffect, useState } from 'react';
import {
  Mic,
  MicOff,
  RotateCcw,
  Globe,
  AlertCircle,
  Sparkles,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { AI_UI_STATES } from '../../utils/aiStateMachine';
import { useFarmerLanguage } from '../../context/FarmerLanguageContext';

export const VoiceSymptomInput = ({
  value,
  onChange,
  onBlur,
  error,
  touched,
  inputClassName,
  aiState = AI_UI_STATES.IDLE,
  onAnalyze,
  onResetAnalysis,
  onListeningStateChange,
}) => {
  const { t, currentMeta } = useFarmerLanguage();
  const [hasRecordedOnce, setHasRecordedOnce] = useState(false);

  const activeSpeechCode = currentMeta?.speechCode || 'en-IN';

  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    language,
    start,
    stop,
    reset,
    setLanguage,
  } = useSpeechRecognition(activeSpeechCode);

  // Automatically synchronize speech recognition language when Farmer switches UI language
  useEffect(() => {
    if (activeSpeechCode && activeSpeechCode !== language) {
      setLanguage(activeSpeechCode);
    }
  }, [activeSpeechCode, language, setLanguage]);

  // Notify parent on listening state changes
  useEffect(() => {
    if (onListeningStateChange) {
      onListeningStateChange(isListening);
    }
  }, [isListening]);

  // Sync speech transcript to parent form state
  useEffect(() => {
    if (transcript) {
      onChange({ target: { name: 'symptoms', value: transcript } });
      setHasRecordedOnce(true);
    }
  }, [transcript]);

  const handleToggleListening = () => {
    if (aiState === AI_UI_STATES.ANALYZING) return;

    if (isListening) {
      stop();
    } else {
      setHasRecordedOnce(true);
      start();
    }
  };

  const handleResetRecording = () => {
    if (aiState === AI_UI_STATES.ANALYZING) return;
    reset();
    onChange({ target: { name: 'symptoms', value: '' } });
    setHasRecordedOnce(false);
    if (onResetAnalysis) onResetAnalysis();
  };

  const isAnalyzing = aiState === AI_UI_STATES.ANALYZING;
  const isAnalysisSuccess = aiState === AI_UI_STATES.ANALYSIS_SUCCESS;
  const hasValidText = value && value.trim().length >= 5;

  return (
    <div className="space-y-4">
      {/* Voice Header & Synchronized Speech Language Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
              {t('report.voice.headerTitle')}
            </h4>
            <p className="text-[11px] text-amber-800">
              {t('report.voice.headerSubtitle')}
            </p>
          </div>
        </div>

        {/* Unified Speech-to-Text Language Status linked to Farmer Preference */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 rounded-lg border border-amber-200 text-xs font-bold text-amber-950 shadow-2xs shrink-0"
          title={`Speech Recognition Mode: ${currentMeta?.nativeName || 'English'} (${activeSpeechCode})`}
        >
          <Globe className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>{currentMeta?.nativeName || 'English'}</span>
          <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-md">
            {activeSpeechCode}
          </span>
        </div>
      </div>

      {/* Prominent Voice Action Button */}
      <div className="flex flex-col items-center justify-center p-5 bg-linear-to-b from-amber-50/40 to-orange-50/30 border border-amber-200 rounded-2xl">
        <div className="relative mb-3">
          {isListening && (
            <>
              <span className="animate-ping absolute inset-0 rounded-full bg-red-400 opacity-60 scale-125" />
              <span className="animate-pulse absolute inset-0 rounded-full bg-amber-400 opacity-40 scale-150" />
            </>
          )}

          <button
            type="button"
            onClick={handleToggleListening}
            disabled={isAnalyzing}
            className={`relative z-10 flex items-center justify-center w-20 h-20 rounded-full shadow-lg transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-200 shadow-red-500/30'
                : hasRecordedOnce
                ? 'bg-amber-600 hover:bg-amber-700 text-white ring-4 ring-amber-200 shadow-amber-500/30'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-200 shadow-emerald-600/30'
            }`}
            aria-label={isListening ? t('report.voice.stop') : t('report.voice.startSpeaking')}
          >
            {isListening ? (
              <MicOff className="w-8 h-8 animate-bounce" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
        </div>

        {/* Dynamic State Text */}
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-slate-900">
            {isListening
              ? t('report.voice.listening')
              : hasRecordedOnce
              ? t('report.voice.startAgain')
              : t('report.voice.tapToSpeak')}
          </p>

          <p className="text-xs text-slate-500 max-w-sm">
            {isListening
              ? t('report.voice.speakingNow')
              : hasRecordedOnce
              ? t('report.voice.clickToAddMore')
              : t('report.voice.speakYourProblem')}
          </p>
        </div>

        {/* Reset / Re-record button when text exists */}
        {hasRecordedOnce && !isAnalyzing && (
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetRecording}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              {t('report.voice.reRecord')}
            </button>
          </div>
        )}
      </div>

      {/* Error Banner if speech recognition error */}
      {speechError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">{t('common.error')}:</p>
            <p className="text-red-700 leading-snug">{speechError}</p>
          </div>
        </div>
      )}

      {/* Unsupported browser fallback note */}
      {!isSupported && (
        <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            {t('report.voice.browserNotSupported')}
          </p>
        </div>
      )}

      {/* Real-time Interim Streaming Transcript Preview */}
      {isListening && interimTranscript && (
        <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 uppercase tracking-wide mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            {t('report.voice.liveVoiceTranscription')}
          </div>
          <p className="text-sm font-medium text-amber-950 italic">
            "{interimTranscript}"
          </p>
        </div>
      )}

      {/* Editable Symptoms / Transcript Box */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="symptoms"
            className="block text-sm font-semibold text-slate-800"
          >
            {t('report.symptoms.prompt')}{' '}
            <span className="text-red-500 ml-0.5" aria-label="required">*</span>
          </label>

          <span className="text-xs text-slate-500">
            {value?.length || 0} {t('report.voice.charCountMin')}
          </span>
        </div>

        <div className="relative">
          <textarea
            id="symptoms"
            name="symptoms"
            rows={4}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={isAnalyzing}
            placeholder={t('report.symptoms.placeholder')}
            className={`${inputClassName} leading-relaxed resize-none disabled:bg-slate-100 disabled:cursor-not-allowed`}
          />
        </div>

        {touched && error ? (
          <p className="flex items-center gap-1 mt-1.5 text-xs font-medium text-red-600">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        ) : (
          <p className="text-xs text-slate-500 leading-snug">
            {t('report.voice.editTranscript')}
          </p>
        )}
      </div>

      {/* Confirm & Analyze Interaction Button */}
      {hasValidText && !isListening && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              isAnalysisSuccess
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-orange-500/20'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('report.submit.analyzingAi')}</span>
              </>
            ) : isAnalysisSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t('report.voice.reRecord')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t('report.voice.confirmAndAnalyze')}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
