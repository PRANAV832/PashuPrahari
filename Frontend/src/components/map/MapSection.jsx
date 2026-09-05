import React, { useState, useMemo } from 'react';
import { MapPin, Radio, ShieldAlert, Sparkles, Filter, Layers, Stethoscope } from 'lucide-react';
import { MapView } from './MapView';
import { mockCases } from '../../data/mockCases';
import { useAuth } from '../../context/AuthContext';

const LEGEND_ITEMS = [
  {
    level:  'Critical (तातडीचे)',
    key:    'CRITICAL',
    dot:    '#ef4444',
    text:   '#b91c1c',
    bg:     '#fef2f2',
    border: '#fecaca',
    pulse:  true,
  },
  {
    level:  'High Risk (उच्च धोका)',
    key:    'HIGH',
    dot:    '#f59e0b',
    text:   '#b45309',
    bg:     '#fffbeb',
    border: '#fde68a',
    pulse:  false,
  },
  {
    level:  'Moderate (मध्यम)',
    key:    'MODERATE',
    dot:    '#eab308',
    text:   '#854d0e',
    bg:     '#fefce8',
    border: '#fef08a',
    pulse:  false,
  },
  {
    level:  'Low (कमी)',
    key:    'LOW',
    dot:    '#10b981',
    text:   '#065f46',
    bg:     '#ecfdf5',
    border: '#a7f3d0',
    pulse:  false,
  },
];

export const MapSection = ({
  cases = mockCases,
  context = 'ADMIN', // 'ADMIN' | 'VETERINARIAN'
}) => {
  const { user } = useAuth();
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('ALL');
  const [showClusters, setShowClusters] = useState(true);

  // Derived counts
  const criticalCount = cases.filter((c) => (c.riskLevel || '').toUpperCase() === 'CRITICAL').length;
  const highCount = cases.filter((c) => (c.riskLevel || '').toUpperCase() === 'HIGH').length;
  const moderateCount = cases.filter((c) => (c.riskLevel || '').toUpperCase() === 'MODERATE').length;
  const lowCount = cases.filter((c) => (c.riskLevel || '').toUpperCase() === 'LOW').length;

  // Filter cases for map
  const displayCases = useMemo(() => {
    if (selectedRiskFilter === 'ALL') return cases;
    return cases.filter((c) => (c.riskLevel || '').toUpperCase() === selectedRiskFilter);
  }, [cases, selectedRiskFilter]);

  return (
    <div className="relative z-0 isolate bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden space-y-4">
      
      {/* ── Top Color Accent Bar ───────────────────────────────────────── */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600" />

      {/* ── Section Header ─────────────────────────────────────────────── */}
      <div className="px-5 sm:px-7 pt-2 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                {context === 'VETERINARIAN'
                  ? 'Local Veterinary Jurisdiction Surveillance Map'
                  : 'District Livestock Disease Surveillance & Geofence Map'}
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-500 pl-10">
            Center: Thane District Command (Bhiwandi, Padgha, Shahapur, Kalyan, Murbad) · Click any pin for incident attributes
          </p>
        </div>

        {/* Controls: Cluster Toggle & Active Indicator */}
        <div className="flex flex-wrap items-center gap-2.5 pl-10 lg:pl-0">
          <button
            type="button"
            onClick={() => setShowClusters(!showClusters)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              showClusters
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${showClusters ? 'text-red-600 animate-pulse' : 'text-slate-400'}`} />
            <span>{showClusters ? 'Hide Outbreak Geofences' : 'Show Outbreak Geofences'}</span>
          </button>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Live Map Active ({displayCases.length} Pins)</span>
          </div>
        </div>
      </div>

      {/* ── Risk Distribution Bar ──────────────────────────────────────── */}
      <div className="px-5 sm:px-7 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
          Risk Distribution:
        </span>
        
        <button
          onClick={() => setSelectedRiskFilter('ALL')}
          className={`px-3 py-1 rounded-xl font-bold transition-all ${
            selectedRiskFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({cases.length})
        </button>

        <button
          onClick={() => setSelectedRiskFilter('CRITICAL')}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl font-bold border transition-all ${
            selectedRiskFilter === 'CRITICAL'
              ? 'bg-red-600 text-white border-red-700 shadow-2xs'
              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span>Critical ({criticalCount})</span>
        </button>

        <button
          onClick={() => setSelectedRiskFilter('HIGH')}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl font-bold border transition-all ${
            selectedRiskFilter === 'HIGH'
              ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
        >
          <span>High ({highCount})</span>
        </button>

        <button
          onClick={() => setSelectedRiskFilter('MODERATE')}
          className={`px-3 py-1 rounded-xl font-bold border transition-all ${
            selectedRiskFilter === 'MODERATE'
              ? 'bg-yellow-500 text-white border-yellow-600 shadow-2xs'
              : 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100'
          }`}
        >
          Moderate ({moderateCount})
        </button>

        <button
          onClick={() => setSelectedRiskFilter('LOW')}
          className={`px-3 py-1 rounded-xl font-bold border transition-all ${
            selectedRiskFilter === 'LOW'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          Low ({lowCount})
        </button>
      </div>

      {/* ── Leaflet Canvas ─────────────────────────────────────────────── */}
      <div className="px-5 sm:px-7">
        <MapView
          cases={displayCases}
          context={context}
          activeVetName={user?.name || 'Dr. Anand Deshmukh'}
          showClusters={showClusters}
        />
      </div>

      {/* ── Risk Legend ────────────────────────────────────────────────── */}
      <div className="px-5 sm:px-7 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {LEGEND_ITEMS.map((item) => (
            <div
              key={item.key}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[11px] font-bold"
              style={{ background: item.bg, color: item.text, borderColor: item.border }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: item.dot }}
              />
              <span>{item.level}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
          {showClusters && (
            <span className="flex items-center gap-1 text-red-700 font-bold">
              <span className="w-2.5 h-2.5 rounded-full border border-dashed border-red-500 bg-red-100" />
              <span>Dashed Circles: Active Outbreak Geofences</span>
            </span>
          )}
          <span>OpenStreetMap Live Tiles</span>
        </div>
      </div>

    </div>
  );
};
