import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, RefreshCw, Stethoscope } from 'lucide-react';
import { VetDashboard } from '../components/veterinarian/VetDashboard';
import { MapSection } from '../components/map/MapSection';
import { caseService } from '../services/caseService';
import { useAuth } from '../context/AuthContext';

export const VeterinarianDashboard = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await caseService.getVetAssignedCases(user);
      setCases(data || []);
    } catch (err) {
      console.error('Failed to fetch assigned cases:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white px-6 py-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          {/* Role badge row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Stethoscope className="w-3.5 h-3.5" />
              District Veterinary Officer (DVO)
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">Thane District Surveillance Unit</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            Veterinary Surveillance &amp; Early Warning Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor incoming syndromic alerts, identify disease clusters, and coordinate veterinary response.
          </p>
        </div>

        {/* Right-side controls */}
        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Active Outbreak Watch: Bhiwandi Cluster
          </div>
          <button
            onClick={fetchCases}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh cases from Backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs">
          Failed to load live cases: {error}
        </div>
      )}

      {/* ── Geospatial Map ─────────────────────────────────────────────────── */}
      <MapSection cases={cases} />

      {/* ── Summary Stats + Case Table ─────────────────────────────────────── */}
      <VetDashboard cases={cases} onRefresh={fetchCases} loading={loading} />

    </div>
  );
};

