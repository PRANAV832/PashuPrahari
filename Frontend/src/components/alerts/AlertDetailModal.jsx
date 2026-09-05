import React from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Stethoscope,
  MapPin,
  Clock,
  ArrowRight,
  ShieldAlert,
  Info,
  Radio,
  FileText,
} from 'lucide-react';
import { ALERT_TYPES } from '../../data/mockAlerts';

export const AlertDetailModal = ({ alert, onClose, onMarkRead }) => {
  if (!alert) return null;

  const isCritical = alert.severity === 'CRITICAL';
  const isHigh = alert.severity === 'HIGH';

  const getTypeIcon = () => {
    switch (alert.type) {
      case ALERT_TYPES.CRITICAL_CASE:
        return <AlertTriangle className="w-5 h-5 text-red-600 animate-bounce" />;
      case ALERT_TYPES.POTENTIAL_OUTBREAK:
        return <Flame className="w-5 h-5 text-red-600" />;
      case ALERT_TYPES.CASE_ASSIGNED:
        return <Stethoscope className="w-5 h-5 text-blue-600" />;
      case ALERT_TYPES.CASE_STATUS_UPDATED:
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case ALERT_TYPES.HIGH_RISK:
      default:
        return <ShieldAlert className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden space-y-0 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div
          className={`px-6 py-5 border-b flex items-center justify-between ${
            isCritical
              ? 'bg-red-50/80 border-red-100'
              : isHigh
              ? 'bg-amber-50/80 border-amber-100'
              : 'bg-slate-50 border-slate-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center shadow-xs">
              {getTypeIcon()}
            </div>
            <div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                isCritical ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
              }`}>
                {alert.severity} ALERT
              </span>
              <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight mt-1">
                {alert.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          
          {/* Main Statement */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Official Alert Statement
            </span>
            <p className="text-sm font-semibold text-slate-900 leading-relaxed">
              {alert.message}
            </p>
          </div>

          {/* Incident Attributes */}
          <div className="grid grid-cols-2 gap-3">
            {alert.caseId && (
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Target Case</span>
                <span className="font-mono font-black text-slate-900 text-xs">{alert.caseId}</span>
              </div>
            )}

            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-0.5">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Location</span>
              <span className="font-bold text-slate-900 flex items-center gap-1 text-xs">
                <MapPin className="w-3 h-3 text-slate-400" />
                {alert.location}
              </span>
            </div>

            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-0.5 col-span-2">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Alert Broadcast Time</span>
              <span className="font-medium text-slate-600 flex items-center gap-1 text-xs">
                <Clock className="w-3 h-3 text-slate-400" />
                {alert.timestamp} ({new Date(alert.createdAt).toLocaleString('en-IN')})
              </span>
            </div>
          </div>

          {/* Recommended Protocol */}
          {alert.recommendedAction && (
            <div className="p-3.5 bg-purple-50/60 border border-purple-200/80 rounded-xl space-y-1">
              <span className="text-[10px] font-black text-purple-900 uppercase tracking-wider block flex items-center gap-1">
                <Info className="w-3 h-3 text-purple-700" />
                Recommended Response Protocol
              </span>
              <p className="text-xs text-purple-950 font-medium leading-relaxed">
                {alert.recommendedAction}
              </p>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onMarkRead(alert.id);
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition-colors"
            >
              Mark as Read
            </button>

            {alert.caseId && (
              <Link
                to={`/veterinarian/cases/${alert.caseId}`}
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-xs transition-colors"
              >
                <span>Open Case Record</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
