/**
 * Isolated Frontend Mock Alerts Store
 * Supports ADMIN and VETERINARIAN roles with 5 standardized alert types.
 */

export const ALERT_TYPES = {
  HIGH_RISK: 'HIGH_RISK',
  CRITICAL_CASE: 'CRITICAL_CASE',
  POTENTIAL_OUTBREAK: 'POTENTIAL_OUTBREAK',
  CASE_ASSIGNED: 'CASE_ASSIGNED',
  CASE_STATUS_UPDATED: 'CASE_STATUS_UPDATED',
};

export const INITIAL_MOCK_ALERTS = [
  {
    id: 'ALT-101',
    type: ALERT_TYPES.CRITICAL_CASE,
    title: '🚨 Critical Case Alert',
    message: 'Case #CASE-1002 (Buffaloes in Padgha) requires immediate veterinary attention. 3 animal deaths reported.',
    caseId: 'CASE-1002',
    location: 'Padgha, Bhiwandi',
    severity: 'CRITICAL',
    timestamp: '10 mins ago',
    createdAt: '2026-08-29T12:50:00Z',
    isRead: false,
    roles: ['ADMIN', 'VETERINARIAN'],
    recommendedAction: 'Dispatch emergency response team and verify vesicular oral lesions.',
  },
  {
    id: 'ALT-102',
    type: ALERT_TYPES.POTENTIAL_OUTBREAK,
    title: '⚠️ Potential Outbreak Cluster',
    message: 'Multiple high-risk bovine cases detected within 6.2km radius near Bhiwandi circle.',
    caseId: 'CASE-1001',
    location: 'Bhiwandi Taluka',
    severity: 'CRITICAL',
    timestamp: '35 mins ago',
    createdAt: '2026-08-29T12:25:00Z',
    isRead: false,
    roles: ['ADMIN', 'VETERINARIAN'],
    recommendedAction: 'Enforce 5km ring quarantine and notify local livestock market.',
  },
  {
    id: 'ALT-103',
    type: ALERT_TYPES.CASE_ASSIGNED,
    title: '👨‍⚕️ Case Assigned',
    message: 'Case #CASE-1001 assigned to Dr. Anand Deshmukh by District Veterinary Command.',
    caseId: 'CASE-1001',
    location: 'Anjeer Phata, Bhiwandi',
    severity: 'HIGH',
    timestamp: '1 hour ago',
    createdAt: '2026-08-29T12:00:00Z',
    isRead: false,
    roles: ['ADMIN', 'VETERINARIAN'],
    recommendedAction: 'Attending surgeon to review clinical symptoms and schedule physical herd inspection.',
  },
  {
    id: 'ALT-104',
    type: ALERT_TYPES.HIGH_RISK,
    title: '⚡ High Risk Syndromic Report',
    message: 'Case #CASE-1006 (Sheep flock in Murbad) flagged with High Risk score (71/100) and lameness.',
    caseId: 'CASE-1006',
    location: 'Murbad Town',
    severity: 'HIGH',
    timestamp: '3 hours ago',
    createdAt: '2026-08-29T10:00:00Z',
    isRead: false,
    roles: ['ADMIN', 'VETERINARIAN'],
    recommendedAction: 'Allocate field assistant for temperature check and shed isolation.',
  },
  {
    id: 'ALT-105',
    type: ALERT_TYPES.CASE_STATUS_UPDATED,
    title: '📋 Case Status Updated',
    message: 'Case #CASE-1005 status updated to RESPONSE DEPLOYED by Dr. Rajesh Jadhav.',
    caseId: 'CASE-1005',
    location: 'Vasind, Shahapur',
    severity: 'MODERATE',
    timestamp: '5 hours ago',
    createdAt: '2026-08-29T08:00:00Z',
    isRead: true,
    roles: ['ADMIN', 'VETERINARIAN'],
    recommendedAction: 'Review biological sample transit docket to SDDL Pune.',
  },
];

const ALERTS_STORAGE_KEY = 'pashuprahari_mock_alerts_store';

export const alertService = {
  async fetchLiveAlerts(role) {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE_URL}/cases`);
      if (res.ok) {
        const data = await res.json();
        if (data.cases && Array.isArray(data.cases)) {
          const liveAlerts = [];
          data.cases.forEach((c) => {
            const riskUpper = (c.riskLevel || '').toUpperCase();
            if (riskUpper === 'CRITICAL') {
              liveAlerts.push({
                id: `ALT-LIVE-${c.id || c._id}`,
                type: ALERT_TYPES.CRITICAL_CASE,
                title: '🚨 Critical Case Alert',
                message: `Case #${c.id || c._id} (${c.species} in ${c.village}) requires immediate veterinary attention. ${c.deaths || 0} animal deaths reported.`,
                caseId: c.id || c._id,
                location: `${c.village || 'Thane Rural'}`,
                severity: 'CRITICAL',
                timestamp: 'Live',
                createdAt: c.reportedAt || c.createdAt || new Date().toISOString(),
                isRead: false,
                roles: ['ADMIN', 'VETERINARIAN'],
                recommendedAction: 'Dispatch emergency response team and verify syndromic lesions.',
              });
            } else if (riskUpper === 'HIGH') {
              liveAlerts.push({
                id: `ALT-LIVE-${c.id || c._id}`,
                type: ALERT_TYPES.HIGH_RISK,
                title: '⚡ High Risk Syndromic Report',
                message: `Case #${c.id || c._id} (${c.species} in ${c.village}) flagged with High Risk score (${c.riskScore || 75}/100).`,
                caseId: c.id || c._id,
                location: `${c.village || 'Thane Rural'}`,
                severity: 'HIGH',
                timestamp: 'Live',
                createdAt: c.reportedAt || c.createdAt || new Date().toISOString(),
                isRead: false,
                roles: ['ADMIN', 'VETERINARIAN'],
                recommendedAction: 'Allocate field assistant for temperature check and shed isolation.',
              });
            }
          });

          // Merge live alerts with static alerts
          const baseAlerts = this.getAlerts(role);
          const combined = [...liveAlerts];
          baseAlerts.forEach((ba) => {
            if (!combined.some((a) => a.caseId && a.caseId === ba.caseId)) {
              combined.push(ba);
            }
          });
          return role ? combined.filter((a) => a.roles.includes(role)) : combined;
        }
      }
    } catch (err) {
      console.warn('Live alerts fetch offline, using store:', err);
    }
    return this.getAlerts(role);
  },

  getAlerts(role) {
    try {
      const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
      if (stored) {
        const allAlerts = JSON.parse(stored);
        if (!role) return allAlerts;
        return allAlerts.filter((a) => a.roles.includes(role));
      }
    } catch {
      // ignore
    }
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_ALERTS));
    if (!role) return [...INITIAL_MOCK_ALERTS];
    return INITIAL_MOCK_ALERTS.filter((a) => a.roles.includes(role));
  },

  getUnreadCount(role) {
    const alerts = this.getAlerts(role);
    return alerts.filter((a) => !a.isRead).length;
  },

  markAsRead(id) {
    try {
      const stored = localStorage.getItem(ALERTS_STORAGE_KEY) || JSON.stringify(INITIAL_MOCK_ALERTS);
      const alerts = JSON.parse(stored);
      const updated = alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a));
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return INITIAL_MOCK_ALERTS;
    }
  },

  markAllAsRead(role) {
    try {
      const stored = localStorage.getItem(ALERTS_STORAGE_KEY) || JSON.stringify(INITIAL_MOCK_ALERTS);
      const alerts = JSON.parse(stored);
      const updated = alerts.map((a) => {
        if (!role || a.roles.includes(role)) {
          return { ...a, isRead: true };
        }
        return a;
      });
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return INITIAL_MOCK_ALERTS;
    }
  },
};
