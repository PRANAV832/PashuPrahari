import React, { useState } from 'react';
import { MapPin, Navigation, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { THANE_COORDINATES } from '../../utils/constants';
import { useFarmerLanguage } from '../../context/FarmerLanguageContext';

export const LocationCard = ({
  latitude,
  longitude,
  onLocationChange,
  errors = {},
  touched = {},
  onBlur,
}) => {
  const { t } = useFarmerLanguage();
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError(t('report.location.notSupported'));
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        onLocationChange(lat, lng);
        setLoading(false);
        setSuccessMsg(t('report.location.statusCaptured'));
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError(t('report.location.permissionDenied'));
            break;
          case err.POSITION_UNAVAILABLE:
            setError(t('report.location.unavailable'));
            break;
          case err.TIMEOUT:
            setError(t('report.location.timeout'));
            break;
          default:
            setError(t('report.location.error'));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleUseFallback = () => {
    onLocationChange(THANE_COORDINATES.lat, THANE_COORDINATES.lng);
    setError(null);
    setSuccessMsg(t('report.location.statusFallback'));
  };

  const hasLat = latitude !== null && latitude !== undefined && String(latitude).trim() !== '';
  const hasLng = longitude !== null && longitude !== undefined && String(longitude).trim() !== '';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Step header — matching green style of other steps */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50 border-b border-slate-200">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold shrink-0">
          4
        </span>
        <div className="flex items-center gap-1.5 text-slate-700">
          <MapPin className="w-4 h-4 text-green-600" />
          <span className="text-sm font-semibold">{t('report.location.title')}</span>
        </div>
        <span className="ml-auto text-[11px] text-slate-500">{t('report.location.optionalBadge')}</span>
      </div>

      <div className="px-5 py-5 sm:px-6 space-y-4">
        {/* Description row + GPS button */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-xs text-slate-500 leading-snug flex-1">
            {t('report.location.description')}
          </p>
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={loading}
            className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-green-600/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t('report.location.fetchingLocation')}</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                <span>{t('report.location.useCurrentLocation')}</span>
              </>
            )}
          </button>
        </div>

        {/* Coordinate input tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div
              className={`rounded-xl border p-3 transition-colors ${
                errors.latitude
                  ? 'bg-red-50/40 border-red-300 ring-1 ring-red-200'
                  : hasLat
                    ? 'bg-green-50/60 border-green-200 focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100'
                    : 'bg-slate-50 border-slate-200 focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100 focus-within:bg-white'
              }`}
            >
              <label
                htmlFor="latitude"
                className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5 cursor-pointer"
              >
                {t('report.location.latitude')}
              </label>
              <input
                type="text"
                inputMode="decimal"
                id="latitude"
                name="latitude"
                value={latitude !== null && latitude !== undefined ? latitude : ''}
                onChange={(e) => {
                  setSuccessMsg(null);
                  onLocationChange(e.target.value, longitude);
                }}
                onBlur={onBlur}
                placeholder="19.2183"
                className="w-full bg-transparent text-sm font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            {errors.latitude && (
              <p className="flex items-center gap-1 mt-1.5 text-xs font-medium text-red-600">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.latitude}</span>
              </p>
            )}
          </div>

          <div>
            <div
              className={`rounded-xl border p-3 transition-colors ${
                errors.longitude
                  ? 'bg-red-50/40 border-red-300 ring-1 ring-red-200'
                  : hasLng
                    ? 'bg-green-50/60 border-green-200 focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100'
                    : 'bg-slate-50 border-slate-200 focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100 focus-within:bg-white'
              }`}
            >
              <label
                htmlFor="longitude"
                className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5 cursor-pointer"
              >
                {t('report.location.longitude')}
              </label>
              <input
                type="text"
                inputMode="decimal"
                id="longitude"
                name="longitude"
                value={longitude !== null && longitude !== undefined ? longitude : ''}
                onChange={(e) => {
                  setSuccessMsg(null);
                  onLocationChange(latitude, e.target.value);
                }}
                onBlur={onBlur}
                placeholder="72.9781"
                className="w-full bg-transparent text-sm font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            {errors.longitude && (
              <p className="flex items-center gap-1 mt-1.5 text-xs font-medium text-red-600">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.longitude}</span>
              </p>
            )}
          </div>
        </div>

        {/* Success feedback */}
        {successMsg && (
          <div className="flex items-start gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error + fallback */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
            <div className="flex items-start gap-2 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-snug">{error}</p>
            </div>
            <button
              type="button"
              onClick={handleUseFallback}
              className="text-xs font-semibold text-green-700 underline underline-offset-2 hover:text-green-900 cursor-pointer"
            >
              {t('report.location.useDefaultZone')} (Lat: {THANE_COORDINATES.lat}, Lng: {THANE_COORDINATES.lng})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
