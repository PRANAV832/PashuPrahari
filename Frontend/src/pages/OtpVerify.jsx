import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  KeyRound,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Loader2,
  AlertCircle,
  Edit2,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService, DEMO_OTP, USER_ROLES, ROLE_HOME_ROUTES } from '../services/authService';
import { APP_NAME, APP_NAME_DEVANAGARI } from '../utils/constants';

const COUNTDOWN_INITIAL = 45;

export const OtpVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithOtp } = useAuth();

  // Retrieve phone from navigation state or session storage
  const phone = location.state?.phone || authService.getPendingPhone();

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(COUNTDOWN_INITIAL);
  const [resendSuccess, setResendSuccess] = useState(false);

  const inputRefs = useRef([]);

  // Auto-focus the first input on load
  useEffect(() => {
    if (!phone) {
      navigate('/login', { replace: true });
      return;
    }
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [phone, navigate]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleDigitChange = (index, value) => {
    setError('');
    const cleaned = value.replace(/\D/g, '');

    if (!cleaned) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned[0];
    setOtpDigits(newDigits);

    if (cleaned[0] && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newDigits = ['', '', '', '', '', ''];
      pastedData.split('').forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pastedData.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  const fullOtp = otpDigits.join('');

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await loginWithOtp(phone, fullOtp);
      // Backend decides role & returns authoritative redirectPath
      const targetPath = result.user?.redirectPath || ROLE_HOME_ROUTES[result.user?.role] || '/farmer/report';
      navigate(targetPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isLoading) return;
    setError('');
    setResendSuccess(false);

    try {
      await authService.requestOtp(phone);
      setCountdown(COUNTDOWN_INITIAL);
      setResendSuccess(true);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setTimeout(() => setResendSuccess(false), 4000);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* ── Main OTP Card ──────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-100 overflow-hidden">
          
          {/* Top accent gradient line */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500" />

          <div className="p-7 sm:p-9 space-y-6">

            {/* Header & Verification Prompt */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 ring-4 ring-emerald-50/50 mb-1">
                <KeyRound className="w-7 h-7" />
              </div>

              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Enter OTP
              </h1>

              <p className="text-xs text-slate-500">
                Verification code dispatched to
              </p>

              {/* Display Phone & Edit option */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="font-mono font-bold text-slate-800">
                  +91 {phone ? `${phone.slice(0, 5)} ${phone.slice(5)}` : '__________'}
                </span>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                >
                  <Edit2 className="w-3 h-3" />
                  Change
                </Link>
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 font-bold">{error}</div>
              </div>
            )}

            {/* Resend success toast */}
            {resendSuccess && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>New OTP has been dispatched.</span>
              </div>
            )}

            {/* 6-Digit OTP Input Form */}
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 text-center uppercase tracking-wider">
                  6-Digit Verification Code
                </label>

                {/* 6 Individual Digit Boxes */}
                <div className="flex justify-between gap-2 sm:gap-2.5" onPaste={handlePaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      disabled={isLoading}
                      className={`w-11 sm:w-12 h-14 text-center text-xl font-black font-mono rounded-2xl border transition-all focus:outline-none focus:ring-2 ${
                        digit
                          ? 'border-emerald-500 bg-emerald-50/30 text-emerald-900 focus:ring-emerald-200'
                          : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:ring-emerald-200 focus:bg-white'
                      } ${error ? 'border-red-300 bg-red-50/20' : ''}`}
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading || fullOtp.length !== 6}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Verify OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* ── Resend & Countdown Section ───────────────────────────── */}
            <div className="flex flex-col items-center justify-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span>Didn't receive the OTP?</span>
                {countdown > 0 ? (
                  <span className="font-semibold text-slate-700 font-mono">
                    Resend in {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Resend OTP
                  </button>
                )}
              </div>

              {/* Development indicator */}
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <Cpu className="w-3 h-3" />
                <span>Demo OTP mode active</span>
              </div>
            </div>

          </div>

          {/* Card footer */}
          <div className="bg-slate-50 px-7 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link
              to="/login"
              className="text-slate-600 hover:text-slate-900 font-semibold hover:underline"
            >
              ← Back to Login
            </Link>
            <span className="text-[11px] text-slate-400">PashuPrahari National Gateway</span>
          </div>

        </div>

      </div>
    </div>
  );
};
