import React, { useState, useEffect, useCallback } from 'react';
import { Stethoscope, RefreshCw, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { VetDashboard } from '../components/veterinarian/VetDashboard';
import { caseService } from '../services/caseService';
import { useAuth } from '../context/AuthContext';

export const VetAssignedCases = () => {
  const { user } = useAuth();
  const vetName = user?.name || 'Dr. Anand Deshmukh';

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssignedCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const assigned = await caseService.getVetAssignedCases(user);
      setCases(assigned || []);
    } catch (err) {
      console.error('Failed to fetch assigned cases:', err);
      setError(err.message);
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAssignedCases();
  }, [fetchAssignedCases]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white px-6 py-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Stethoscope className="w-3.5 h-3.5" />
              Assigned Field Officer: {vetName}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">{user?.district || 'Thane Veterinary Unit'}</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            My Assigned Clinical Cases (नियुक्त रुग्ण अहवाल)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Cases allocated to your clinical jurisdiction for physical inspection, sampling, and treatment monitoring.
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{cases.length} Allocated Cases</span>
          </div>
          <button
            onClick={fetchAssignedCases}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh assigned cases"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs">
          Failed to load assigned cases: {error}
        </div>
      )}

      {/* ── Assigned Cases Table & Detail Modal ────────────────────────────── */}
      <VetDashboard cases={cases} onRefresh={fetchAssignedCases} loading={loading} />

    </div>
  );
};
