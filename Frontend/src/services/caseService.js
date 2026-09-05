import { mockCases } from '../data/mockCases';
import { MOCK_FARMER_CASES_BY_USER } from '../data/mockFarmerData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

let casesStore = [...mockCases];

const VILLAGE_COORDS = {
  'anjeer phata': { lat: 19.3002, lng: 73.0597 },
  'bhiwandi': { lat: 19.3002, lng: 73.0597 },
  'padgha': { lat: 19.3512, lng: 73.1624 },
  'kalyan': { lat: 19.2403, lng: 73.1305 },
  'kalyan rural': { lat: 19.2403, lng: 73.1305 },
  'shahapur': { lat: 19.4533, lng: 73.3322 },
  'shahapur town': { lat: 19.4533, lng: 73.3322 },
  'vasind': { lat: 19.4010, lng: 73.2800 },
  'murbad': { lat: 19.2600, lng: 73.3900 },
  'murbad town': { lat: 19.2600, lng: 73.3900 },
};

const getCoordinates = (c) => {
  if (c.lat !== undefined && c.lat !== null && c.lng !== undefined && c.lng !== null) {
    return { lat: Number(c.lat), lng: Number(c.lng), latitude: Number(c.lat), longitude: Number(c.lng) };
  }
  if (c.latitude !== undefined && c.latitude !== null && c.longitude !== undefined && c.longitude !== null) {
    return { lat: Number(c.latitude), lng: Number(c.longitude), latitude: Number(c.latitude), longitude: Number(c.longitude) };
  }
  const villageKey = (c.village || '').toLowerCase().trim();
  for (const [key, coords] of Object.entries(VILLAGE_COORDS)) {
    if (villageKey.includes(key)) {
      return { lat: coords.lat, lng: coords.lng, latitude: coords.lat, longitude: coords.lng };
    }
  }
  return { lat: 19.3002, lng: 73.0597, latitude: 19.3002, longitude: 73.0597 };
};

const normalizeCase = (c) => {
  if (!c) return null;
  const id = c.id || c._id || 'CASE-UNKNOWN';
  const farmerName = c.farmerName || 'Ramesh Patil';
  const farmerPhone = c.farmerPhone || c.mobile || c.contact || '';
  const village = c.village || 'Anjeer Phata';
  const species = c.species || 'Cattle / Cow';
  const rawSymptoms = c.symptoms || [];
  const symptoms = Array.isArray(rawSymptoms) ? rawSymptoms : [rawSymptoms];
  const status = (c.status || 'REPORTED').toUpperCase().replace(/\s+/g, '_');
  const riskLevel = (c.riskLevel || 'PENDING').toUpperCase();
  const reportedAt = c.reportedAt || c.createdAt || new Date().toISOString();
  const coords = getCoordinates(c);

  const rawInput = c.rawInput || c.originalFarmerReport || '';
  const aiAnalysisObj = c.aiAnalysis
    ? {
        ...c.aiAnalysis,
        symptoms: (c.aiAnalysis.symptoms && c.aiAnalysis.symptoms.length > 0)
          ? c.aiAnalysis.symptoms
          : symptoms,
        possibleConditions: Array.isArray(c.aiAnalysis.possibleConditions) ? c.aiAnalysis.possibleConditions : [],
        recommendations: Array.isArray(c.aiAnalysis.recommendations) ? c.aiAnalysis.recommendations : [],
        explanation: c.aiAnalysis.explanation || '',
      }
    : {
        symptoms,
        possibleConditions: [],
        recommendations: [],
        explanation: '',
      };

  return {
    ...c,
    id,
    _id: c._id || id,
    farmerName,
    farmerPhone,
    contact: farmerPhone,
    village,
    species,
    rawInput,
    originalFarmerReport: rawInput,
    symptoms,
    aiAnalysis: aiAnalysisObj,
    status,
    statusLabel: c.statusLabel || c.status || 'Reported',
    riskLevel,
    riskScore: c.riskScore ?? 0,
    reportedAt,
    affectedAnimals: c.affectedAnimals || 1,
    deaths: c.deaths || 0,
    duration: c.duration || '1-2 days',
    latestUpdate: c.latestUpdate || c.treatmentNotes || 'Report logged in system.',
    assignedVet: c.assignedVet || c.assignedTo || null,
    assignedTo: c.assignedTo || c.assignedVet || null,
    assignedAt: c.assignedAt || null,
    treatmentNotes: c.treatmentNotes || '',
    labReferral: Boolean(c.labReferral),
    labNotes: c.labNotes || '',
    lat: coords.lat,
    lng: coords.lng,
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
};

import { authService } from './authService';

const getAuthHeaders = () => {
  const token = authService.getToken();
  const user = authService.getCurrentUser();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (user?.id || user?._id) {
    headers['x-user-id'] = user.id || user._id;
  }
  if (user?.phone) {
    headers['x-user-phone'] = user.phone;
  }
  return headers;
};

export const caseService = {
  async getCases(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.farmer) params.append('farmer', filters.farmer);
      if (filters.assignedVet) params.append('assignedVet', filters.assignedVet);
      if (filters.assignedVetId) params.append('assignedVetId', filters.assignedVetId);
      if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);

      const qs = params.toString();
      const url = qs ? `${API_BASE_URL}/cases?${qs}` : `${API_BASE_URL}/cases`;

      const res = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.cases && Array.isArray(data.cases)) {
          return data.cases.map(normalizeCase);
        }
      }
    } catch (err) {
      console.warn('API getCases unreachable, using fallback store:', err);
    }
    return casesStore.map(normalizeCase);
  },

  async getCaseById(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/cases/${id}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.case) return normalizeCase(data.case);
      } else if (res.status === 403) {
        throw new Error('Access Denied: This case is outside your assigned clinical jurisdiction.');
      }
    } catch (err) {
      if (err.message && err.message.includes('Access Denied')) {
        throw err;
      }
      console.warn('API getCaseById unreachable, using fallback store:', err);
    }
    const found = casesStore.find((c) => (c.id === id || c._id === id));
    return found ? normalizeCase(found) : null;
  },

  async getFarmerCases(farmerInput) {
    const searchName = (typeof farmerInput === 'object' ? farmerInput?.name : farmerInput) || '';
    const searchPhone = (typeof farmerInput === 'object' ? farmerInput?.phone : farmerInput) || '';
    const query = searchPhone || searchName;

    try {
      const cases = await this.getCases(query ? { farmer: query } : {});
      if (cases && cases.length > 0) {
        return cases;
      }
    } catch (err) {
      console.warn('API getFarmerCases failed, falling back to local merge:', err);
    }

    // Fallback: merge with mock demo cases if database has no cases for this user
    const all = await this.getCases();
    const mockKey = searchName || 'Ramesh Patil';
    const mockUserCases = (MOCK_FARMER_CASES_BY_USER[mockKey] || MOCK_FARMER_CASES_BY_USER['Ramesh Patil'] || []).map(normalizeCase);

    const combined = [...all];
    for (const mockC of mockUserCases) {
      if (!combined.some((c) => c.id === mockC.id)) {
        combined.push(mockC);
      }
    }

    if (!searchName && !searchPhone) return combined;

    const sName = searchName.toLowerCase().trim();
    const sPhone = searchPhone.replace(/\D/g, '').trim();

    return combined.filter((c) => {
      const cName = (c.farmerName || '').toLowerCase();
      const cPhone = (c.farmerPhone || c.mobile || '').replace(/\D/g, '');
      const matchName = sName && cName && (cName.includes(sName) || sName.includes(cName));
      const matchPhone = sPhone && cPhone && (cPhone.includes(sPhone) || sPhone.includes(cPhone));
      return matchName || matchPhone;
    });
  },

  async getVetAssignedCases(vetInput) {
    const user = authService.getCurrentUser();
    const vetObj = (typeof vetInput === 'object' && vetInput !== null) ? vetInput : user;
    const vetName = (vetObj?.name || (typeof vetInput === 'string' ? vetInput : '') || 'Dr. Anand Deshmukh').trim();
    const vetId = (vetObj?._id || vetObj?.id || '').toString().trim();
    const employeeId = (vetObj?.employeeId || '').trim();

    try {
      const filter = vetId ? { assignedVetId: vetId } : { assignedVet: vetName };
      const cases = await this.getCases(filter);
      if (cases && Array.isArray(cases)) {
        return cases;
      }
    } catch (err) {
      console.warn('API getVetAssignedCases failed, checking store:', err);
    }

    const all = await this.getCases();
    const searchName = vetName.toLowerCase();
    return all.filter((c) => {
      const caseVetId = (c.assignedVetId || '').toString().trim();
      const caseVetName = (c.assignedVet || c.assignedTo || '').toLowerCase().trim();

      if (vetId && caseVetId) {
        if (caseVetId === vetId) return true;
      }
      if (employeeId && caseVetId) {
        if (caseVetId === employeeId) return true;
      }
      if (searchName && caseVetName) {
        if (caseVetName === searchName || caseVetName.includes(searchName) || searchName.includes(caseVetName)) return true;
      }
      return false;
    });
  },

  async analyzeSymptoms(data) {
    const res = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.error || resData.message || 'Failed to analyze symptoms');
    }
    return resData;
  },

  async submitReport(reportData) {
    try {
      const res = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(reportData),
      });
      const data = await res.json();
      if (res.ok && data.case) {
        const norm = normalizeCase(data.case);
        casesStore = [norm, ...casesStore];
        return norm;
      } else if (!res.ok) {
        throw new Error(data.message || 'Failed to submit report');
      }
    } catch (err) {
      const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';
      if (useMock) {
        console.warn('API submitReport failed, using local store fallback:', err);
        const newCase = normalizeCase({
          id: `CASE-${1000 + casesStore.length + 1}`,
          ...reportData,
          reportedAt: new Date().toISOString(),
          status: reportData.status || 'REPORTED',
          riskScore: reportData.riskScore || 75,
          riskLevel: reportData.riskLevel || 'HIGH',
        });
        casesStore = [newCase, ...casesStore];
        return newCase;
      }
      throw err;
    }
  },

  async updateCase(id, updateData) {
    try {
      const res = await fetch(`${API_BASE_URL}/cases/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });
      const data = await res.json();
      if (res.ok && data.case) {
        const norm = normalizeCase(data.case);
        const idx = casesStore.findIndex((c) => (c.id === id || c._id === id));
        if (idx !== -1) casesStore[idx] = norm;
        return norm;
      } else if (!res.ok) {
        throw new Error(data.message || 'Failed to update case');
      }
    } catch (err) {
      const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';
      if (useMock) {
        console.warn('API updateCase failed, updating local store fallback:', err);
        const idx = casesStore.findIndex((c) => (c.id === id || c._id === id));
        if (idx !== -1) {
          casesStore[idx] = normalizeCase({
            ...casesStore[idx],
            ...updateData,
            updatedAt: new Date().toISOString(),
          });
          return casesStore[idx];
        }
      }
      throw err;
    }
  },

  async updateCaseStatus(id, newStatus) {
    return this.updateCase(id, { status: newStatus });
  },

  async assignVeterinarian(id, vetName) {
    return this.updateCase(id, {
      assignedVet: vetName,
      assignedTo: vetName,
      status: 'UNDER_INVESTIGATION',
      assignedAt: new Date().toISOString(),
    });
  },

  async unassignVeterinarian(id) {
    return this.updateCase(id, {
      assignedVet: null,
      assignedTo: null,
      status: 'REPORTED',
      assignedAt: null,
    });
  },
};

