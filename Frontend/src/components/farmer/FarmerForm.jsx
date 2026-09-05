import React, { useState } from 'react';
import {
  User,
  Activity,
  AlertTriangle,
  Clock,
  Send,
  AlertCircle,
} from 'lucide-react';
import { LocationCard } from './LocationCard';
import { VoiceSymptomInput } from './VoiceSymptomInput';
import { AIAnalysisCard } from './AIAnalysisCard';
import {
  AI_UI_STATES,
  DEFAULT_DEV_ANALYSIS_RESULT,
} from '../../utils/aiStateMachine';
import {
  LIVESTOCK_SPECIES,
  DURATION_OPTIONS,
  VACCINATION_STATUS_OPTIONS,
} from '../../utils/constants';
import { caseService } from '../../services/caseService';
import { useAuth } from '../../context/AuthContext';
import { useFarmerLanguage } from '../../context/FarmerLanguageContext';

/* ─────────────────────────────────────────────
   Shared style tokens
───────────────────────────────────────────── */
const INPUT_BASE =
  'w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all';
const INPUT_NORMAL = 'border-slate-300 focus:ring-green-200 focus:border-green-600';
const INPUT_ERROR  = 'border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50/30';

const sectionCard = 'bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden';

/* Small step-label pill shown before each section */
const StepBadge = ({ number, label, icon: Icon, color = 'green' }) => {
  const palette = {
    green:  { pill: 'bg-green-600',  ring: 'bg-green-50 border-green-200 text-green-700' },
    amber:  { pill: 'bg-amber-500',  ring: 'bg-amber-50 border-amber-200 text-amber-700' },
    slate:  { pill: 'bg-slate-500',  ring: 'bg-slate-50 border-slate-200 text-slate-700' },
  }[color];

  return (
    <div className={`flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 ${palette.ring} border-0`}>
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold shrink-0 ${palette.pill}`}>
        {number}
      </span>
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-4 h-4" />}
        <span className="text-sm font-semibold">{label}</span>
      </div>
    </div>
  );
};

/* Inline field error message */
const FieldError = ({ message }) =>
  message ? (
    <p className="flex items-center gap-1 mt-1.5 text-xs font-medium text-red-600">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </p>
  ) : null;

/* ─────────────────────────────────────────────
   Main Form Component
───────────────────────────────────────────── */
export const FarmerForm = ({ onSubmitSuccess }) => {
  const { user } = useAuth();
  const { t } = useFarmerLanguage();

  const [formData, setFormData] = useState({
    farmerName: user?.name || '',
    village: user?.village || '',
    species: '',
    symptoms: '',
    affectedAnimals: '1',
    deaths: '0',
    duration: '',
    vaccinationStatus: '',
    latitude: null,
    longitude: null,
  });

  const [errors,       setErrors]       = useState({});
  const [touched,      setTouched]      = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── AI Processing State Machine ───────────────────
  const [aiState,         setAiState]         = useState(AI_UI_STATES.IDLE);
  const [analysisData,    setAnalysisData]    = useState(null);
  const [aiErrorMessage,  setAiErrorMessage]  = useState(null);

  /* ── Validation ────────────────────────────────── */
  const validate = (data = formData) => {
    const errs = {};

    if (!data.farmerName?.trim())
      errs.farmerName = t('report.validation.farmerNameRequired');

    if (!data.village?.trim())
      errs.village = t('report.validation.villageRequired');

    if (!data.species)
      errs.species = t('report.validation.speciesRequired');

    if (!data.symptoms?.trim())
      errs.symptoms = t('report.validation.symptomsRequired');
    else if (data.symptoms.trim().length < 5)
      errs.symptoms = t('report.validation.symptomsMinLength');

    const affected = Number(data.affectedAnimals);
    if (data.affectedAnimals === '' || isNaN(affected) || affected < 1)
      errs.affectedAnimals = t('report.validation.affectedMin');

    const deathsNum = Number(data.deaths);
    if (data.deaths === '' || isNaN(deathsNum) || deathsNum < 0)
      errs.deaths = t('report.validation.deathsMin');
    else if (!isNaN(affected) && deathsNum > affected)
      errs.deaths = t('report.validation.deathsMax');

    if (!data.duration)
      errs.duration = t('report.validation.durationRequired');

    if (!data.vaccinationStatus)
      errs.vaccinationStatus = t('report.validation.vaccinationRequired');

    // Location validation (Optional, but if entered, must be valid number between -90..90 and -180..180)
    const rawLat = data.latitude !== null && data.latitude !== undefined ? String(data.latitude).trim() : '';
    const rawLng = data.longitude !== null && data.longitude !== undefined ? String(data.longitude).trim() : '';

    if (rawLat !== '') {
      const numLat = Number(rawLat);
      if (isNaN(numLat) || numLat < -90 || numLat > 90) {
        errs.latitude = t('report.validation.latitudeInvalid') || 'Latitude must be a valid number between -90 and 90.';
      }
    }

    if (rawLng !== '') {
      const numLng = Number(rawLng);
      if (isNaN(numLng) || numLng < -180 || numLng > 180) {
        errs.longitude = t('report.validation.longitudeInvalid') || 'Longitude must be a valid number between -180 and 180.';
      }
    }

    if (rawLat !== '' && rawLng === '' && !errs.latitude) {
      errs.longitude = t('report.validation.longitudeRequired') || 'Longitude is required when latitude is entered.';
    } else if (rawLng !== '' && rawLat === '' && !errs.longitude) {
      errs.latitude = t('report.validation.latitudeRequired') || 'Latitude is required when longitude is entered.';
    }

    return errs;
  };

  /* ── Handlers ──────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    if (touched[name]) setErrors(validate(updated));

    // Update AI state on symptom text change
    if (name === 'symptoms') {
      if (value.trim().length >= 5) {
        if (aiState === AI_UI_STATES.IDLE || aiState === AI_UI_STATES.LISTENING) {
          setAiState(AI_UI_STATES.TRANSCRIPT_READY);
        }
      } else {
        if (aiState === AI_UI_STATES.TRANSCRIPT_READY) {
          setAiState(AI_UI_STATES.IDLE);
        }
      }
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate());
  };

  const handleLocationChange = (lat, lng) => {
    const updated = { ...formData, latitude: lat, longitude: lng };
    setFormData(updated);
    if (touched.latitude || touched.longitude) {
      setErrors(validate(updated));
    }
  };

  /* ── AI State Machine Transitions ──────────────── */
  const handleListeningStateChange = (isListening) => {
    if (isListening) {
      setAiState(AI_UI_STATES.LISTENING);
    } else {
      if (formData.symptoms && formData.symptoms.trim().length >= 5) {
        setAiState(AI_UI_STATES.TRANSCRIPT_READY);
      } else {
        setAiState(AI_UI_STATES.IDLE);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!formData.symptoms || formData.symptoms.trim().length < 5) {
      setTouched((prev) => ({ ...prev, symptoms: true }));
      setErrors((prev) => ({
        ...prev,
        symptoms: t('report.validation.symptomsMinLength'),
      }));
      return;
    }

    setAiState(AI_UI_STATES.ANALYZING);
    setAiErrorMessage(null);

    try {
      const res = await caseService.analyzeSymptoms({
        symptoms: formData.symptoms.trim(),
        rawInput: formData.symptoms.trim(),
        species: formData.species || 'Cattle',
        affectedAnimals: Number(formData.affectedAnimals) || 1,
        deaths: Number(formData.deaths) || 0,
      });

      const analysisResult = {
        symptoms: res.symptoms || [],
        possibleConditions: res.aiAnalysis?.possibleConditions || [],
        recommendations: res.aiAnalysis?.recommendations || [],
        explanation: res.aiAnalysis?.explanation || '',
        riskScore: res.riskScore,
        riskLevel: res.riskLevel,
        disclaimer: DEFAULT_DEV_ANALYSIS_RESULT.disclaimer,
      };

      setAnalysisData(analysisResult);
      setAiState(AI_UI_STATES.ANALYSIS_SUCCESS);
    } catch (err) {
      console.error('❌ AI Analysis error:', err);
      setAiErrorMessage(err.message || t('report.ai.failedAnalysis'));
      setAiState(AI_UI_STATES.ANALYSIS_ERROR);
    }
  };

  const handleRetryAnalysis = () => {
    handleAnalyze();
  };

  const handleResetAnalysis = () => {
    setAiState(AI_UI_STATES.IDLE);
    setAnalysisData(null);
    setAiErrorMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allTouched = {
      farmerName: true, village: true, species: true, symptoms: true,
      affectedAnimals: true, deaths: true, duration: true,
      vaccinationStatus: true, latitude: true, longitude: true,
    };
    setTouched(allTouched);

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstKey = Object.keys(validationErrors)[0];
      const el = document.getElementsByName(firstKey)[0];
      if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      return;
    }

    setIsSubmitting(true);

    const rawLat = formData.latitude !== null && formData.latitude !== undefined ? String(formData.latitude).trim() : '';
    const rawLng = formData.longitude !== null && formData.longitude !== undefined ? String(formData.longitude).trim() : '';

    const finalLat = rawLat !== '' && !isNaN(Number(rawLat)) ? parseFloat(Number(rawLat).toFixed(6)) : null;
    const finalLng = rawLng !== '' && !isNaN(Number(rawLng)) ? parseFloat(Number(rawLng).toFixed(6)) : null;

    const structuredPayload = {
      farmerName:        formData.farmerName.trim() || user?.name || 'Farmer',
      farmerPhone:       user?.phone || '',
      village:           formData.village.trim() || user?.village || 'Thane Rural',
      species:           formData.species,
      rawInput:          formData.symptoms.trim(),
      symptoms:          formData.symptoms.trim(),
      affectedAnimals:   Number(formData.affectedAnimals),
      deaths:            Number(formData.deaths),
      duration:          formData.duration,
      vaccinationStatus: formData.vaccinationStatus,
      lat:               finalLat,
      lng:               finalLng,
    };

    console.log('✅ [PashuPrahari Frontend] Submitting Report to Backend:', structuredPayload);

    try {
      const savedCase = await caseService.submitReport(structuredPayload);
      setIsSubmitting(false);
      if (onSubmitSuccess) {
        onSubmitSuccess({
          ...savedCase,
          farmerName: savedCase.farmerName || formData.farmerName.trim(),
          village: savedCase.village || formData.village.trim(),
          species: savedCase.species || formData.species,
          symptoms: savedCase.symptoms || formData.symptoms.trim(),
          affectedAnimals: savedCase.affectedAnimals ?? formData.affectedAnimals,
          deaths: savedCase.deaths ?? formData.deaths,
          duration: savedCase.duration || formData.duration,
          vaccinationStatus: savedCase.vaccinationStatus || formData.vaccinationStatus,
          latitude: savedCase.lat ?? finalLat,
          longitude: savedCase.lng ?? finalLng,
          riskScore: savedCase.riskScore,
          riskLevel: savedCase.riskLevel,
          aiAnalysis: savedCase.aiAnalysis,
          id: savedCase.id || savedCase._id,
        });
      }
    } catch (err) {
      console.error('❌ [PashuPrahari Frontend] Submission failed:', err);
      setIsSubmitting(false);
      setErrors((prev) => ({ ...prev, submit: err.message }));
    }
  };

  /* ── Helpers ───────────────────────────────────── */
  const inputCls = (field) =>
    `${INPUT_BASE} ${errors[field] && touched[field] ? INPUT_ERROR : INPUT_NORMAL}`;

  const hasVisibleErrors =
    Object.keys(errors).length > 0 && Object.keys(touched).length > 0;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">

      {/* ── STEP 1 · Farmer Details ─────────────────────────────────── */}
      <div className={sectionCard}>
        <StepBadge number="1" label={t('report.farmerDetails.title')} icon={User} color="green" />

        <div className="px-5 py-5 sm:px-6 space-y-4">
          <div>
            <label htmlFor="farmerName" className="block text-sm font-semibold text-slate-800 mb-1.5">
              {t('report.farmerDetails.fullName')} <span className="text-red-500 ml-0.5" aria-label="required">*</span>
            </label>
            <input
              type="text"
              id="farmerName"
              name="farmerName"
              autoComplete="name"
              value={formData.farmerName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t('report.farmerDetails.fullNamePlaceholder')}
              className={inputCls('farmerName')}
            />
            <FieldError message={touched.farmerName && errors.farmerName} />
          </div>

          <div>
            <label htmlFor="village" className="block text-sm font-semibold text-slate-800 mb-1.5">
              {t('report.farmerDetails.village')} <span className="text-red-500 ml-0.5" aria-label="required">*</span>
            </label>
            <input
              type="text"
              id="village"
              name="village"
              value={formData.village}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t('report.farmerDetails.villagePlaceholder')}
              className={inputCls('village')}
            />
            <FieldError message={touched.village && errors.village} />
          </div>
        </div>
      </div>

      {/* ── STEP 2 · Livestock Particulars ─────────────────────────── */}
      <div className={sectionCard}>
        <StepBadge number="2" label={t('report.livestockDetails.title')} icon={Activity} color="green" />

        <div className="px-5 py-5 sm:px-6 space-y-4">

          {/* Species */}
          <div>
            <label htmlFor="species" className="block text-sm font-semibold text-slate-800 mb-1.5">
              {t('report.livestockDetails.animalSpecies')} <span className="text-red-500 ml-0.5" aria-label="required">*</span>
            </label>
            <select
              id="species"
              name="species"
              value={formData.species}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputCls('species')}
            >
              <option value="">{t('report.livestockDetails.selectSpecies')}</option>
              {LIVESTOCK_SPECIES.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
            <FieldError message={touched.species && errors.species} />
          </div>

          {/* Affected + Deaths */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="affectedAnimals" className="block text-sm font-semibold text-slate-800 mb-1.5">
                {t('report.livestockDetails.animalsAffected')} <span className="text-red-500 ml-0.5" aria-label="required">*</span>
              </label>
              <input
                type="number"
                id="affectedAnimals"
                name="affectedAnimals"
                min="1"
                value={formData.affectedAnimals}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputCls('affectedAnimals')}
              />
              <FieldError message={touched.affectedAnimals && errors.affectedAnimals} />
            </div>

            <div>
              <label htmlFor="deaths" className="block text-sm font-semibold text-slate-800 mb-1.5">
                <span className="flex items-center gap-1">
                  {t('report.livestockDetails.numberOfDeaths')} <span className="text-red-500 ml-0.5" aria-label="required">*</span>
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700 uppercase tracking-wide">
                    {t('report.livestockDetails.criticalBadge')}
                  </span>
                </span>
              </label>
              <input
                type="number"
                id="deaths"
                name="deaths"
                min="0"
                value={formData.deaths}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputCls('deaths')}
              />
              <FieldError message={touched.deaths && errors.deaths} />
            </div>
          </div>

          {/* Duration + Vaccination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="duration" className="block text-sm font-semibold text-slate-800 mb-1.5">
                {t('report.livestockDetails.durationOfIllness')} <span className="text-red-500 ml-0.5" aria-label="required">*</span>
              </label>
              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputCls('duration')}
              >
                <option value="">{t('report.livestockDetails.selectDuration')}</option>
                {DURATION_OPTIONS.map((dur) => (
                  <option key={dur} value={dur}>{dur}</option>
                ))}
              </select>
              <FieldError message={touched.duration && errors.duration} />
            </div>

            <div>
              <label htmlFor="vaccinationStatus" className="block text-sm font-semibold text-slate-800 mb-1.5">
                {t('report.livestockDetails.vaccinationStatus')} <span className="text-red-500 ml-0.5" aria-label="required">*</span>
              </label>
              <select
                id="vaccinationStatus"
                name="vaccinationStatus"
                value={formData.vaccinationStatus}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputCls('vaccinationStatus')}
              >
                <option value="">{t('report.livestockDetails.selectVaccination')}</option>
                {VACCINATION_STATUS_OPTIONS.map((vac) => (
                  <option key={vac} value={vac}>{vac}</option>
                ))}
              </select>
              <FieldError message={touched.vaccinationStatus && errors.vaccinationStatus} />
            </div>
          </div>
        </div>
      </div>

      {/* ── STEP 3 · Observed Symptoms & Voice Input ──────────────────── */}
      <div className="bg-white border-2 border-amber-300 rounded-2xl shadow-sm overflow-hidden">
        {/* Amber accent bar */}
        <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />

        <div className="flex items-center gap-3 px-5 py-3.5 bg-amber-50 border-b border-amber-200">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold shrink-0">
            3
          </span>
          <div className="flex items-center gap-1.5 text-amber-800">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-semibold">{t('report.symptoms.title')}</span>
          </div>
          <span className="ml-auto text-[11px] font-semibold uppercase tracking-wider text-amber-600 bg-amber-100 border border-amber-300 rounded-full px-2.5 py-0.5">
            {t('report.symptoms.triageBadge')}
          </span>
        </div>

        <div className="px-5 py-5 sm:px-6 space-y-4">
          <VoiceSymptomInput
            value={formData.symptoms}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.symptoms}
            touched={touched.symptoms}
            inputClassName={inputCls('symptoms')}
            aiState={aiState}
            onAnalyze={handleAnalyze}
            onResetAnalysis={handleResetAnalysis}
            onListeningStateChange={handleListeningStateChange}
          />

          {/* AI Decision Support Analysis Card */}
          <AIAnalysisCard
            aiState={aiState}
            analysisData={analysisData}
            errorMessage={aiErrorMessage}
            onRetry={handleRetryAnalysis}
            onReset={handleResetAnalysis}
          />
        </div>
      </div>

      {/* ── STEP 4 · Incident Location ──────────────────────────────── */}
      <LocationCard
        latitude={formData.latitude}
        longitude={formData.longitude}
        onLocationChange={handleLocationChange}
        errors={errors}
        touched={touched}
        onBlur={handleBlur}
      />

      {/* ── Form‑level Error Summary ─────────────────────────────────── */}
      {errors.submit && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-xl px-4 py-3.5 flex items-start justify-between gap-3 animate-fadeIn"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-800">
              <p className="font-semibold mb-0.5">{t('report.submit.submissionError')}</p>
              <p>{errors.submit}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {hasVisibleErrors && !errors.submit && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-xl px-4 py-3.5 flex items-start gap-3"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs text-red-800">
            <p className="font-semibold mb-1">{t('report.submit.validationSummaryTitle')}</p>
            <ul className="list-disc list-inside space-y-0.5 text-red-700">
              {Object.entries(errors)
                .filter(([k]) => k !== 'submit')
                .map(([_, err], i) => (
                  <li key={i}>{err}</li>
                ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Submit ─────────────────────────────────────────────────────── */}
      <div className="pt-1">
        <p className="text-[11px] text-slate-500 mb-3 text-center">
          {t('report.submit.requiredFieldsNote')}
        </p>

        <button
          type="submit"
          disabled={isSubmitting || aiState === AI_UI_STATES.ANALYZING}
          className="w-full flex items-center justify-center gap-2.5 px-8 py-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold rounded-2xl transition-colors shadow-md shadow-green-600/25 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-base"
        >
          {isSubmitting || aiState === AI_UI_STATES.ANALYZING ? (
            <>
              <Clock className="w-5 h-5 animate-spin" />
              <span>
                {aiState === AI_UI_STATES.ANALYZING
                  ? t('report.submit.analyzingAi')
                  : t('report.submit.submitting')}
              </span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>{t('report.submit.submitReport')}</span>
            </>
          )}
        </button>

        <p className="mt-3 text-center text-[11px] text-slate-400">
          {t('report.submit.securityNote')}
        </p>
      </div>
    </form>
  );
};
