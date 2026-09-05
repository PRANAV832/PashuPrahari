import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlus,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Phone,
  MapPin,
  Building2,
  Copy,
  Check,
} from 'lucide-react';
import { validatePhoneNumber } from '../../services/authService';
import { userService } from '../../services/userService';
import {
  adminUserService,
  USER_STATUSES,
} from '../../data/mockAdminUsers';

export const RegisterFarmer = () => {
  const navigate = useNavigate();

  // Generate a realistic default Farmer Reference ID
  const generateRefId = () => `FMR-MH-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    village: '',
    district: 'Thane',
    state: 'Maharashtra',
    farmerRefId: generateRefId(),
    assignedArea: 'Bhiwandi Sub-division',
    status: USER_STATUSES.ACTIVE,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredResult, setRegisteredResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const validateField = (field, value) => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Farmer full name is required';
        if (value.trim().length < 3) return 'Name must be at least 3 characters';
        return null;
      case 'mobile':
        const phoneRes = validatePhoneNumber(value);
        return phoneRes.isValid ? null : phoneRes.error;
      case 'village':
        if (!value.trim()) return 'Village name is required';
        return null;
      case 'district':
        if (!value.trim()) return 'District is required';
        return null;
      case 'assignedArea':
        if (!value.trim()) return 'Assigned area / veterinary circle is required';
        return null;
      default:
        return null;
    }
  };

  const validateForm = () => {
    const errs = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) errs[key] = err;
    });
    return errs;
  };

  const handleChange = (field, value) => {
    // Support both direct (field, value) calls and standard event (e) calls
    if (typeof field === 'object' && field?.target) {
      const { name, value: val } = field.target;
      setFormData((prev) => ({ ...prev, [name]: val }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
    }
  };

  const handleBlur = (field) => {
    const fieldName = typeof field === 'object' && field?.target ? field.target.name : field;
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const err = validateField(fieldName, formData[fieldName]);
    if (err) {
      setErrors((prev) => ({ ...prev, [fieldName]: err }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      mobile: true,
      village: true,
      district: true,
      state: true,
      farmerRefId: true,
      assignedArea: true,
    });

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.mobile.replace(/\D/g, ''),
        role: 'FARMER',
        roleLabel: 'Registered Livestock Owner / Farmer',
        farmerRefId: formData.farmerRefId.trim(),
        village: formData.village.trim(),
        district: formData.district.trim(),
        assignedArea: formData.assignedArea.trim(),
        status: formData.status || 'ACTIVE'
      };

      const newRecord = await userService.registerUser(payload);
      adminUserService.registerFarmer(formData);
      setRegisteredResult(newRecord || formData);
    } catch (err) {
      setErrors({ form: err.message || 'Failed to register farmer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyId = () => {
    if (registeredResult?.id) {
      navigator.clipboard.writeText(registeredResult.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResetForNext = () => {
    setRegisteredResult(null);
    setFormData({
      name: '',
      mobile: '',
      village: '',
      district: 'Thane',
      state: 'Maharashtra',
      farmerRefId: generateRefId(),
      assignedArea: 'Bhiwandi Sub-division',
      status: USER_STATUSES.ACTIVE,
    });
    setTouched({});
    setErrors({});
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">

      {/* ── Breadcrumb & Navigation ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to User Directory
        </Link>
        <span className="text-xs font-mono text-purple-700 font-semibold bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
          Admin Enrollment Gateway
        </span>
      </div>

      {/* ── Official Government Access Authority Notice ──────────────────── */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-6 shadow-md space-y-2">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-purple-300" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-200">
            Official Veterinary Administration Protocol
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black">
          Farmer &amp; Livestock Owner Registration
        </h1>
        <p className="text-xs text-purple-200 leading-relaxed max-w-2xl">
          "Only users registered by the Veterinary Department can access PashuPrahari." Once registered, the farmer can securely sign in using their mobile number and OTP.
        </p>
      </div>

      {/* ── Confirmation / Success Screen ────────────────────────────────── */}
      {registeredResult ? (
        <div className="bg-white border border-emerald-200 rounded-3xl p-7 sm:p-9 shadow-lg shadow-emerald-50 space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3 pb-4 border-b border-emerald-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Registration Confirmed
              </span>
              <h2 className="text-xl font-black text-slate-900">
                Farmer Authorized Successfully
              </h2>
            </div>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Farmer Reference ID:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm text-slate-900">{registeredResult.id}</span>
                <button
                  onClick={handleCopyId}
                  className="p-1 rounded-md bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                  title="Copy Reference ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Full Name:</span>
              <span className="font-bold text-slate-900">{registeredResult.name}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Registered Mobile:</span>
              <span className="font-mono font-bold text-slate-900">+91 {registeredResult.mobile}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Jurisdiction / Village:</span>
              <span className="font-bold text-slate-900">{registeredResult.village}, {registeredResult.district}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Account Status:</span>
              <span className="font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px]">
                {registeredResult.status}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleResetForNext}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
            >
              + Register Another Farmer
            </button>
            <Link
              to="/admin/users"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold text-center transition-colors"
            >
              View User Directory
            </Link>
          </div>
        </div>
      ) : (
        /* ── Main Registration Form ──────────────────────────────────────── */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-9 shadow-xs">
          
          {errors.form && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            
            {/* 1. Full Name */}
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                Full Name (शेतकऱ्याचे संपूर्ण नाव) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="e.g. Ramesh Narayan Patil"
                disabled={isSubmitting}
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.name && touched.name
                    ? 'border-red-300 focus:ring-red-200 bg-red-50/20'
                    : 'border-slate-300 focus:ring-purple-200 focus:border-purple-600'
                }`}
              />
              {errors.name && touched.name && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                </p>
              )}
            </div>

            {/* 2. Mobile Number & Farmer Reference ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Mobile Number (मोबाईल क्रमांक) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex rounded-xl shadow-2xs">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 text-slate-600 font-semibold text-xs select-none">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={formData.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value.replace(/\D/g, ''))}
                    onBlur={() => handleBlur('mobile')}
                    placeholder="9876543210"
                    disabled={isSubmitting}
                    className={`block w-full rounded-r-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.mobile && touched.mobile
                        ? 'border-red-300 focus:ring-red-200 bg-red-50/20'
                        : 'border-slate-300 focus:ring-purple-200 focus:border-purple-600'
                    }`}
                  />
                </div>
                {errors.mobile && touched.mobile ? (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.mobile}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-400">Used for OTP sign-in and automated SMS alerts</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Farmer Reference ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.farmerRefId}
                  onChange={(e) => handleChange('farmerRefId', e.target.value)}
                  onBlur={() => handleBlur('farmerRefId')}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-600"
                />
                {errors.farmerRefId && touched.farmerRefId && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.farmerRefId}
                  </p>
                )}
              </div>
            </div>

            {/* 3. Village, District, State */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Village (गाव) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.village}
                  onChange={(e) => handleChange('village', e.target.value)}
                  onBlur={() => handleBlur('village')}
                  placeholder="e.g. Padgha"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.village && touched.village
                      ? 'border-red-300 focus:ring-red-200 bg-red-50/20'
                      : 'border-slate-300 focus:ring-purple-200 focus:border-purple-600'
                  }`}
                />
                {errors.village && touched.village && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.village}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  District (जिल्हा) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                  onBlur={() => handleBlur('district')}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  State (राज्य) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  onBlur={() => handleBlur('state')}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-600"
                />
              </div>
            </div>

            {/* 4. Assigned Area & Account Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Assigned Veterinary Area / Circle <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.assignedArea}
                  onChange={(e) => handleChange('assignedArea', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-600 font-medium"
                >
                  <option value="Bhiwandi Sub-division">Bhiwandi Sub-division</option>
                  <option value="Padgha Veterinary Circle">Padgha Veterinary Circle</option>
                  <option value="Shahapur Poultry Zone">Shahapur Poultry Zone</option>
                  <option value="Kalyan Rural Block">Kalyan Rural Block</option>
                  <option value="Murbad Sub-Division">Murbad Sub-Division</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Account Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-600 font-bold"
                >
                  <option value={USER_STATUSES.ACTIVE}>ACTIVE (Authorized immediately)</option>
                  <option value={USER_STATUSES.PENDING}>PENDING (Verification required)</option>
                  <option value={USER_STATUSES.SUSPENDED}>SUSPENDED (Temporary freeze)</option>
                  <option value={USER_STATUSES.REVOKED}>REVOKED (Access revoked)</option>
                </select>
              </div>
            </div>

            {/* Submit & Cancel Actions */}
            <div className="pt-5 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                to="/admin/users"
                className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-200 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enrolling Farmer...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Authorize &amp; Register Farmer</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
