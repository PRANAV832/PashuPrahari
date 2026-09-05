import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  Lock,
  Globe2,
  Check,
  Languages,
} from 'lucide-react';
import { authService, validatePhoneNumber } from '../services/authService';
import { useFarmerLanguage } from '../context/FarmerLanguageContext';
import { APP_NAME, APP_NAME_DEVANAGARI } from '../utils/constants';
import logoImg from '../assets/logo.jpg';

export const Login = () => {
  const navigate = useNavigate();
  const { lang, setLang } = useFarmerLanguage();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  // Farmer language selection modal state
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [pendingFarmerPhone, setPendingFarmerPhone] = useState('');
  const [selectedLanguageCode, setSelectedLanguageCode] = useState(lang || 'en');

  const formatDisplayPhone = (value) => {
    return value.replace(/\D/g, '').slice(0, 10);
  };

  const handlePhoneChange = (e) => {
    const clean = formatDisplayPhone(e.target.value);
    setPhoneNumber(clean);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    const validation = validatePhoneNumber(phoneNumber);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await authService.requestOtp(validation.cleaned);

      // If registered role is FARMER, open language selection popup
      if (res && res.role === 'FARMER') {
        setPendingFarmerPhone(validation.cleaned);
        setShowLanguageModal(true);
      } else {
        // ADMIN or VETERINARIAN continues directly to OTP verification
        navigate('/verify', {
          state: { phone: validation.cleaned, role: res?.role },
        });
      }
    } catch (err) {
      setError(err.message || 'Mobile number is not registered with PashuPrahari.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectLanguageAndContinue = (chosenLang) => {
    sessionStorage.setItem('pashuprahari_pending_farmer_lang', chosenLang);
    setLang(chosenLang);
    setShowLanguageModal(false);
    navigate('/verify', {
      state: { phone: pendingFarmerPhone, role: 'FARMER', language: chosenLang },
    });
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* ── Main Login Card ────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-100 overflow-hidden">
          
          {/* Top accent gradient line */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500" />

          <div className="p-7 sm:p-9 space-y-6">

            {/* Header / Brand Identity */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-md shadow-emerald-200/80 ring-4 ring-emerald-50 mb-1 overflow-hidden p-0.5 border border-emerald-100">
                <img src={logoImg} alt="PashuPrahari Logo" className="w-full h-full object-cover rounded-xl" />
              </div>

              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {APP_NAME}
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {APP_NAME_DEVANAGARI}
                </span>
              </div>

              {/* Subtitle: Registered User Login */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                <Lock className="w-3 h-3 text-emerald-600" />
                Registered User Login
              </div>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{error}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="mobile-number"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Mobile Number
                </label>

                <div className="relative flex rounded-2xl shadow-xs">
                  {/* +91 Country Code Box */}
                  <span className="inline-flex items-center px-3.5 rounded-l-2xl border border-r-0 border-slate-300 bg-slate-50 text-slate-600 text-sm font-semibold select-none">
                    🇮🇳 +91
                  </span>

                  {/* Input field */}
                  <input
                    id="mobile-number"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="__________"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    onBlur={() => setTouched(true)}
                    maxLength={10}
                    disabled={isLoading}
                    className={`block w-full rounded-r-2xl border px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      error && touched
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50/30'
                        : 'border-slate-300 focus:ring-emerald-200 focus:border-emerald-600 bg-white'
                    }`}
                  />
                </div>

                <p className="text-[11px] text-slate-400 flex items-center justify-between px-1 pt-0.5">
                  <span>Enter 10-digit registered number</span>
                  <span className="font-mono">{phoneNumber.length}/10</span>
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || phoneNumber.length !== 10}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Checking Registration...</span>
                  </>
                ) : (
                  <>
                    <span>Send OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Required Helper Text */}
            <div className="pt-2 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 leading-relaxed">
                Only users registered by the Veterinary Department can access PashuPrahari.
              </p>
            </div>

          </div>

          {/* Footer note */}
          <div className="bg-slate-50 px-7 py-3.5 border-t border-slate-100 text-center text-xs text-slate-500 space-y-0.5">
            <p className="font-semibold text-slate-700">Verified National Livestock Health Surveillance Gateway</p>
            <p className="text-[11px] text-slate-400">Department of Animal Husbandry &amp; Veterinary Services</p>
          </div>

        </div>

      </div>

      {/* ── Farmer Language Selection Popup Modal ──────────────────────────── */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            
            {/* Modal Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 ring-4 ring-emerald-50/50 mb-1">
                <Globe2 className="w-7 h-7" />
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Select Your Language
              </h2>

              <p className="text-xs text-slate-500 font-medium">
                आपली भाषा निवडा / अपनी भाषा चुनें
              </p>
            </div>

            {/* Large Selection Options */}
            <div className="space-y-3">
              {/* 1. English */}
              <button
                type="button"
                onClick={() => handleSelectLanguageAndContinue('en')}
                className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all cursor-pointer group ${
                  selectedLanguageCode === 'en'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">🇬🇧</span>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-950">
                      English
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Continue in English
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              {/* 2. Hindi */}
              <button
                type="button"
                onClick={() => handleSelectLanguageAndContinue('hi')}
                className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all cursor-pointer group ${
                  selectedLanguageCode === 'hi'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">🇮🇳</span>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-950">
                      हिंदी (Hindi)
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      हिंदी भाषा में जारी रखें
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              {/* 3. Marathi */}
              <button
                type="button"
                onClick={() => handleSelectLanguageAndContinue('mr')}
                className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all cursor-pointer group ${
                  selectedLanguageCode === 'mr'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">🇮🇳</span>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-950">
                      मराठी (Marathi)
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      मराठी भाषेत पुढे जा
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            <div className="pt-2 text-center text-[11px] text-slate-400">
              <span>You can also change language anytime from the top bar.</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
