import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Phone,
  Building,
  Briefcase,
  Copy,
  Check,
  Award,
} from 'lucide-react';
import { validatePhoneNumber } from '../../services/authService';
import { userService } from '../../services/userService';
import {
  adminUserService,
  USER_STATUSES,
} from '../../data/mockAdminUsers';

export const RegisterVeterinarian = () => {
  const navigate = useNavigate();

  const generateEmployeeId = () => `VET-MH-${Math.floor(8800 + Math.random() * 1000)}`;

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    employeeId: generateEmployeeId(),
    department: 'Department of Animal Husbandry (Epidemiology Wing)',
    designation: 'Veterinary Officer / Field Epidemiologist',
    districtArea: 'Thane District - Bhiwandi Central',
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
        if (!value.trim()) return 'Veterinarian full name is required';
        if (value.trim().length < 4) return 'Name must be at least 4 characters';
        return null;
      case 'mobile':
        const phoneRes = validatePhoneNumber(value);
        return phoneRes.isValid ? null : phoneRes.error;
      case 'employeeId':
        if (!value.trim()) return 'Employee ID is required';
        return null;
      case 'department':
        if (!value.trim()) return 'Department is required';
        return null;
      case 'designation':
        if (!value.trim()) return 'Designation is required';
        return null;
      case 'districtArea':
        if (!value.trim()) return 'Assigned jurisdiction area is required';
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
      employeeId: true,
      department: true,
      designation: true,
      districtArea: true,
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
        role: 'VETERINARIAN',
        roleLabel: formData.designation || 'Veterinary Officer',
        employeeId: formData.employeeId.trim(),
        department: formData.department.trim(),
        designation: formData.designation.trim(),
        assignedArea: formData.districtArea.trim(),
        district: 'Thane',
        status: formData.status || 'ACTIVE'
      };

      const newRecord = await userService.registerUser(payload);
      adminUserService.registerVeterinarian(formData);
      setRegisteredResult(newRecord || formData);
    } catch (err) {
      setErrors({ form: err.message || 'Failed to register veterinarian.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyId = () => {
    if (registeredResult?.employeeId) {
      navigator.clipboard.writeText(registeredResult.employeeId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResetForNext = () => {
    setRegisteredResult(null);
    setFormData({
      name: '',
      mobile: '',
      employeeId: generateEmployeeId(),
      department: 'Department of Animal Husbandry (Epidemiology Wing)',
      designation: 'Veterinary Officer / Field Epidemiologist',
      districtArea: 'Thane District - Bhiwandi Central',
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
          Veterinary Accreditation Authority
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
          Veterinary Surgeon &amp; Officer Accreditation
        </h1>
        <p className="text-xs text-purple-200 leading-relaxed max-w-2xl">
          "Only users registered by the Veterinary Department can access PashuPrahari." Enrolled veterinary officers gain diagnostic investigation privileges and case triage access.
        </p>
      </div>

      {/* ── Confirmation / Success Screen ────────────────────────────────── */}
      {registeredResult ? (
        <div className="bg-white border border-purple-200 rounded-3xl p-7 sm:p-9 shadow-lg shadow-purple-50 space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3 pb-4 border-b border-purple-100">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                Accreditation Confirmed
              </span>
              <h2 className="text-xl font-black text-slate-900">
                Veterinary Officer Enrolled Successfully
              </h2>
            </div>
          </div>

          <div className="bg-purple-50/50 border border-purple-200 rounded-2xl p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Veterinary / Employee ID:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm text-purple-950">{registeredResult.employeeId}</span>
                <button
                  onClick={handleCopyId}
                  className="p-1 rounded-md bg-white border border-purple-300 text-purple-800 hover:bg-purple-100"
                  title="Copy Employee ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-purple-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Officer Full Name:</span>
              <span className="font-bold text-slate-900">{registeredResult.name}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Registered Mobile:</span>
              <span className="font-mono font-bold text-slate-900">+91 {registeredResult.mobile}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Designation &amp; Department:</span>
              <span className="font-bold text-slate-900">{registeredResult.designation} ({registeredResult.department})</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Jurisdiction Area:</span>
              <span className="font-bold text-slate-900">{registeredResult.districtArea}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Account Status:</span>
              <span className="font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[11px]">
                {registeredResult.status}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleResetForNext}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-colors"
            >
              + Register Another Veterinarian
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
            
            {/* 1. Full Name & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Doctor / Officer Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder="e.g. Dr. Priya Patil"
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

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Official Mobile Number <span className="text-red-500">*</span>
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
                    placeholder="9822011223"
                    disabled={isSubmitting}
                    className={`block w-full rounded-r-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.mobile && touched.mobile
                        ? 'border-red-300 focus:ring-red-200 bg-red-50/20'
                        : 'border-slate-300 focus:ring-purple-200 focus:border-purple-600'
                    }`}
                  />
                </div>
                {errors.mobile && touched.mobile && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.mobile}
                  </p>
                )}
              </div>
            </div>

            {/* 2. Employee ID & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Veterinary / Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => handleChange('employeeId', e.target.value)}
                  onBlur={() => handleBlur('employeeId')}
                  placeholder="e.g. VET-MH-8806"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-600"
                />
                {errors.employeeId && touched.employeeId && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.employeeId}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Department Wing <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-600 font-medium"
                >
                  <option value="Department of Animal Husbandry (Epidemiology Wing)">Department of Animal Husbandry (Epidemiology Wing)</option>
                  <option value="Livestock Development Department">Livestock Development Department</option>
                  <option value="Rural Veterinary Services">Rural Veterinary Services</option>
                  <option value="Veterinary Polyclinic & Hospital">Veterinary Polyclinic &amp; Hospital</option>
                  <option value="Mobile Veterinary Clinic Unit">Mobile Veterinary Clinic Unit</option>
                </select>
              </div>
            </div>

            {/* 3. Designation & District / Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Designation <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.designation}
                  onChange={(e) => handleChange('designation', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-600 font-medium"
                >
                  <option value="District Veterinary Officer (DVO)">District Veterinary Officer (DVO)</option>
                  <option value="Livestock Development Officer">Livestock Development Officer</option>
                  <option value="Veterinary Surgeon (Grade I)">Veterinary Surgeon (Grade I)</option>
                  <option value="Senior Veterinary Officer">Senior Veterinary Officer</option>
                  <option value="Veterinary Officer (Mobile Clinical Unit)">Veterinary Officer (Mobile Clinical Unit)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  District / Operational Jurisdiction Area <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.districtArea}
                  onChange={(e) => handleChange('districtArea', e.target.value)}
                  onBlur={() => handleBlur('districtArea')}
                  placeholder="e.g. Thane District - Padgha Sub-Center"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.districtArea && touched.districtArea
                      ? 'border-red-300 focus:ring-red-200 bg-red-50/20'
                      : 'border-slate-300 focus:ring-purple-200 focus:border-purple-600'
                  }`}
                />
                {errors.districtArea && touched.districtArea && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.districtArea}
                  </p>
                )}
              </div>
            </div>

            {/* 4. Account Status */}
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
                <option value={USER_STATUSES.ACTIVE}>ACTIVE (Authorized immediately for investigation dispatch)</option>
                <option value={USER_STATUSES.PENDING}>PENDING (VCI License credential verification in progress)</option>
                <option value={USER_STATUSES.SUSPENDED}>SUSPENDED (Temporary freeze)</option>
                <option value={USER_STATUSES.REVOKED}>REVOKED (Access revoked)</option>
              </select>
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
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-200 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Accrediting Officer...</span>
                  </>
                ) : (
                  <>
                    <Stethoscope className="w-4 h-4" />
                    <span>Authorize &amp; Accredit Veterinarian</span>
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
