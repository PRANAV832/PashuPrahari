import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Stethoscope,
  ShieldAlert,
  Clock,
  X,
  ChevronRight,
  Sparkles,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { alertService, ALERT_TYPES } from '../../data/mockAlerts';
import { AlertDetailModal } from './AlertDetailModal';
import { useAuth } from '../../context/AuthContext';

export const NotificationBell = () => {
  const { role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState(() => alertService.getAlerts(role));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'UNREAD'
  const dropdownRef = useRef(null);

  const loadAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const liveAlerts = await alertService.fetchLiveAlerts(role);
      setAlerts(liveAlerts);
    } catch (err) {
      console.error('Failed to fetch live alerts:', err);
      setError(err.message || 'Failed to sync alerts');
      setAlerts(alertService.getAlerts(role));
    } finally {
      setLoading(false);
    }
  };

  // Sync alerts on role change and on open
  useEffect(() => {
    loadAlerts();
  }, [role]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const handleMarkAsRead = (id) => {
    alertService.markAsRead(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
  };

  const handleMarkAllRead = () => {
    alertService.markAllAsRead(role);
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  const handleAlertClick = (alertItem) => {
    handleMarkAsRead(alertItem.id);
    setSelectedAlert(alertItem);
    setIsOpen(false);
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterMode === 'UNREAD') return !a.isRead;
    return true;
  });

  const getAlertIcon = (type) => {
    switch (type) {
      case ALERT_TYPES.CRITICAL_CASE:
        return <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />;
      case ALERT_TYPES.POTENTIAL_OUTBREAK:
        return <Flame className="w-4 h-4 text-red-600" />;
      case ALERT_TYPES.CASE_ASSIGNED:
        return <Stethoscope className="w-4 h-4 text-blue-600" />;
      case ALERT_TYPES.CASE_STATUS_UPDATED:
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case ALERT_TYPES.HIGH_RISK:
      default:
        return <ShieldAlert className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* ── Notification Bell Trigger Button ──────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
        aria-label="Open notifications"
      >
        <Bell className="w-4 h-4" />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white ring-2 ring-white animate-in zoom-in-50">
            {unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Notification Panel ─────────────────────────────────── */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Panel Header */}
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900">Surveillance Alerts</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.2 rounded-full bg-red-100 text-red-700 text-[10px] font-black">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadAlerts}
                disabled={loading}
                className="p-1 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50"
                title="Sync alerts"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark read</span>
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs border-b border-red-200 flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={loadAlerts}
                className="font-bold underline text-[11px]"
              >
                Retry
              </button>
            </div>
          )}

          {/* Filter Pills */}
          <div className="px-5 py-2.5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setFilterMode('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterMode === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('UNREAD')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterMode === 'UNREAD'
                  ? 'bg-white text-amber-800 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Alert List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="py-10 text-center text-xs text-slate-400 space-y-2">
                <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
                <p className="font-semibold text-slate-600">Syncing live alerts...</p>
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 space-y-1">
                <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-600">No active alerts</p>
                <p className="text-[11px]">All clear in your surveillance jurisdiction.</p>
              </div>
            ) : (
              filteredAlerts.map((alt) => (
                <div
                  key={alt.id}
                  onClick={() => handleAlertClick(alt)}
                  className={`p-4 flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-50 ${
                    !alt.isRead ? 'bg-amber-50/30' : 'bg-white'
                  }`}
                >
                  {/* Icon */}
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {getAlertIcon(alt.type)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-slate-900 text-xs">
                        {alt.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {alt.timestamp}
                      </span>
                    </div>

                    <p className="text-slate-600 leading-snug line-clamp-2 text-[11px]">
                      {alt.message}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-semibold text-slate-400">
                        {alt.location}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Panel Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              PashuPrahari Notification Engine
            </span>
          </div>

        </div>
      )}

      {/* ── Alert Detail Modal ────────────────────────────────────────── */}
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onMarkRead={handleMarkAsRead}
        />
      )}

    </div>
  );
};
