const Case = require('../models/Case');
const User = require('../models/User');
const mongoose = require('mongoose');
const { sendRiskAlert } = require('../services/smsService');

// In-memory fallback storage when MongoDB is not running locally
const inMemoryCases = [
  {
    _id: 'CASE-1002',
    id: 'CASE-1002',
    farmerName: 'Sunita Gaikwad',
    farmerPhone: '9988776655',
    contact: '+91 99887 76655',
    village: 'Padgha',
    taluka: 'Bhiwandi',
    district: 'Thane',
    species: 'Bovine (Buffalo)',
    symptoms: ['High Fever', 'Mouth Lesions', 'Lameness'],
    affectedAnimals: 12,
    deaths: 3,
    duration: '3 days',
    riskScore: 94,
    riskLevel: 'CRITICAL',
    status: 'UNDER_INVESTIGATION',
    assignedVet: 'Dr. Priya Patil',
    assignedTo: 'Dr. Priya Patil',
    assignedVetId: 'VET-MH-8802',
    lat: 19.3512,
    lng: 73.1624,
    latitude: 19.3512,
    longitude: 73.1624,
    createdAt: '2026-08-27T11:00:00.000Z',
    updatedAt: '2026-08-27T11:30:00.000Z',
  },
  {
    _id: 'CASE-1005',
    id: 'CASE-1005',
    farmerName: 'Meena Kamble',
    farmerPhone: '9811233445',
    contact: '+91 98112 33445',
    village: 'Vasind',
    taluka: 'Shahapur',
    district: 'Thane',
    species: 'Poultry (Chicken)',
    symptoms: ['Sudden Death', 'Respiratory Distress', 'Blue Comb'],
    affectedAnimals: 85,
    deaths: 22,
    duration: '1 day',
    riskScore: 97,
    riskLevel: 'CRITICAL',
    status: 'CONFIRMED',
    assignedVet: 'Dr. Rajesh Jadhav',
    assignedTo: 'Dr. Rajesh Jadhav',
    assignedVetId: 'VET-04',
    lat: 19.4010,
    lng: 73.2800,
    latitude: 19.4010,
    longitude: 73.2800,
    createdAt: '2026-08-27T06:00:00.000Z',
    updatedAt: '2026-08-27T07:15:00.000Z',
  },
  {
    _id: 'CASE-1001',
    id: 'CASE-1001',
    farmerName: 'Ramesh Patil',
    farmerPhone: '9123456789',
    contact: '+91 91234 56789',
    village: 'Anjeer Phata',
    taluka: 'Bhiwandi',
    district: 'Thane',
    species: 'Bovine (Cow)',
    symptoms: ['High Fever', 'Foot Blisters', 'Excess Salivation'],
    affectedAnimals: 6,
    deaths: 1,
    duration: '2 days',
    riskScore: 85,
    riskLevel: 'HIGH',
    status: 'REPORTED',
    assignedVet: null,
    assignedTo: null,
    assignedVetId: null,
    lat: 19.3002,
    lng: 73.0597,
    latitude: 19.3002,
    longitude: 73.0597,
    createdAt: '2026-08-27T10:15:00.000Z',
    updatedAt: '2026-08-27T10:15:00.000Z',
  },
  {
    _id: 'CASE-1006',
    id: 'CASE-1006',
    farmerName: 'Ganesh Ware',
    farmerPhone: '9765432198',
    contact: '+91 97654 32198',
    village: 'Murbad Town',
    taluka: 'Murbad',
    district: 'Thane',
    species: 'Ovine (Sheep)',
    symptoms: ['Fever', 'Skin Lesions', 'Limping'],
    affectedAnimals: 18,
    deaths: 2,
    duration: '3 days',
    riskScore: 78,
    riskLevel: 'HIGH',
    status: 'REPORTED',
    assignedVet: null,
    assignedTo: null,
    assignedVetId: null,
    lat: 19.2486,
    lng: 73.3986,
    latitude: 19.2486,
    longitude: 73.3986,
    createdAt: '2026-08-26T22:10:00.000Z',
    updatedAt: '2026-08-26T22:10:00.000Z',
  },
  {
    _id: 'CASE-1007',
    id: 'CASE-1007',
    farmerName: 'Prakash Mhatre',
    farmerPhone: '9822344556',
    contact: '+91 98223 44556',
    village: 'Khadavali Phata',
    taluka: 'Kalyan',
    district: 'Thane',
    species: 'Caprine (Goat)',
    symptoms: ['Fever', 'Diarrhea', 'Nasal Discharge'],
    affectedAnimals: 8,
    deaths: 2,
    duration: '2 days',
    riskScore: 75,
    riskLevel: 'HIGH',
    status: 'UNDER_INVESTIGATION',
    assignedVet: 'Dr. Sunil Shinde',
    assignedTo: 'Dr. Sunil Shinde',
    assignedVetId: 'VET-03',
    lat: 19.2980,
    lng: 73.2100,
    latitude: 19.2980,
    longitude: 73.2100,
    createdAt: '2026-08-26T18:30:00.000Z',
    updatedAt: '2026-08-26T19:00:00.000Z',
  },
  {
    _id: 'CASE-1003',
    id: 'CASE-1003',
    farmerName: 'Dattatray Shinde',
    farmerPhone: '9654321987',
    contact: '+91 96543 21987',
    village: 'Kalyan Rural',
    taluka: 'Kalyan',
    district: 'Thane',
    species: 'Caprine (Goat)',
    symptoms: ['Lethargy', 'Mild Swelling', 'Nasal Discharge'],
    affectedAnimals: 4,
    deaths: 0,
    duration: '1 day',
    riskScore: 47,
    riskLevel: 'MODERATE',
    status: 'SUSPECTED',
    assignedVet: 'Dr. Anand Deshmukh',
    assignedTo: 'Dr. Anand Deshmukh',
    assignedVetId: 'VET-MH-8801',
    lat: 19.2403,
    lng: 73.1305,
    latitude: 19.2403,
    longitude: 73.1305,
    createdAt: '2026-08-27T08:30:00.000Z',
    updatedAt: '2026-08-27T09:00:00.000Z',
  },
  {
    _id: 'CASE-1008',
    id: 'CASE-1008',
    farmerName: 'Sanjay Pawar',
    farmerPhone: '9833411223',
    contact: '+91 98334 11223',
    village: 'Dombivli East',
    taluka: 'Kalyan',
    district: 'Thane',
    species: 'Bovine (Cow)',
    symptoms: ['Loss of Appetite', 'Mild Fever'],
    affectedAnimals: 2,
    deaths: 0,
    duration: '2 days',
    riskScore: 42,
    riskLevel: 'MODERATE',
    status: 'MONITORING',
    assignedVet: null,
    assignedTo: null,
    assignedVetId: null,
    lat: 19.2184,
    lng: 73.0867,
    latitude: 19.2184,
    longitude: 73.0867,
    createdAt: '2026-08-26T12:00:00.000Z',
    updatedAt: '2026-08-26T12:00:00.000Z',
  },
  {
    _id: 'CASE-1004',
    id: 'CASE-1004',
    farmerName: 'Vikas Jadhav',
    farmerPhone: '9543210987',
    contact: '+91 95432 10987',
    village: 'Shahapur Town',
    taluka: 'Shahapur',
    district: 'Thane',
    species: 'Bovine (Cow)',
    symptoms: ['Drop in Milk Yield', 'Mild Fever'],
    affectedAnimals: 3,
    deaths: 0,
    duration: '2 days',
    riskScore: 22,
    riskLevel: 'LOW',
    status: 'MONITORING',
    assignedVet: null,
    assignedTo: null,
    assignedVetId: null,
    lat: 19.4533,
    lng: 73.3322,
    latitude: 19.4533,
    longitude: 73.3322,
    createdAt: '2026-08-26T15:45:00.000Z',
    updatedAt: '2026-08-26T15:45:00.000Z',
  },
  {
    _id: 'CASE-1009',
    id: 'CASE-1009',
    farmerName: 'Balaram Tare',
    farmerPhone: '9819055443',
    contact: '+91 98190 55443',
    village: 'Val Village',
    taluka: 'Bhiwandi',
    district: 'Thane',
    species: 'Caprine (Goat)',
    symptoms: ['Minor Coughing'],
    affectedAnimals: 2,
    deaths: 0,
    duration: '1 day',
    riskScore: 18,
    riskLevel: 'LOW',
    status: 'MONITORING',
    assignedVet: null,
    assignedTo: null,
    assignedVetId: null,
    lat: 19.2780,
    lng: 73.0450,
    latitude: 19.2780,
    longitude: 73.0450,
    createdAt: '2026-08-25T14:20:00.000Z',
    updatedAt: '2026-08-25T14:20:00.000Z',
  },
  {
    _id: 'CASE-1010',
    id: 'CASE-1010',
    farmerName: 'Santosh Naik',
    farmerPhone: '9820166778',
    contact: '+91 98201 66778',
    village: 'Titwala',
    taluka: 'Kalyan',
    district: 'Thane',
    species: 'Bovine (Cow)',
    symptoms: ['Skin Itchiness (Recovered)'],
    affectedAnimals: 1,
    deaths: 0,
    duration: '5 days',
    riskScore: 10,
    riskLevel: 'LOW',
    status: 'RESOLVED',
    assignedVet: 'Dr. Anand Deshmukh',
    assignedTo: 'Dr. Anand Deshmukh',
    assignedVetId: 'VET-MH-8801',
    lat: 19.2989,
    lng: 73.2081,
    latitude: 19.2989,
    longitude: 73.2081,
    createdAt: '2026-08-24T09:00:00.000Z',
    updatedAt: '2026-08-24T10:00:00.000Z',
  },
];

const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper to verify if a case is assigned to a specific veterinarian user
const isCaseAssignedToVet = (caseItem, vetUser) => {
  if (!caseItem || !vetUser) return false;
  const vetId = (vetUser._id ? vetUser._id.toString() : (vetUser.id || '')).trim();
  const vetEmpId = (vetUser.employeeId || '').trim();
  const vetName = (vetUser.name || '').toLowerCase().trim();

  const caseVetId = (caseItem.assignedVetId || '').trim();
  const caseVetName = (caseItem.assignedVet || caseItem.assignedTo || '').toLowerCase().trim();

  if (vetId && caseVetId && caseVetId === vetId) return true;
  if (vetEmpId && caseVetId && caseVetId === vetEmpId) return true;
  if (vetName && caseVetName && (caseVetName === vetName || caseVetName.includes(vetName) || vetName.includes(caseVetName))) return true;

  return false;
};

// POST /api/reports
const createReport = async (req, res, next) => {
  try {
    const {
      farmerName,
      farmerPhone,
      village,
      species,
      rawInput,
      symptoms,
      affectedAnimals,
      deaths,
      duration,
      vaccinationStatus,
      lat,
      lng,
      aiAnalysis,
      riskScore,
      riskLevel,
      status,
      assignedTo,
      assignedVet,
      assignedVetId,
      assignedRole,
      treatmentNotes,
      labReferral,
      labNotes
    } = req.body;

    const inputForAi = (rawInput && rawInput.trim()) || (typeof symptoms === 'string' ? symptoms : '');
    let finalSymptoms = Array.isArray(symptoms) ? symptoms : [];
    let finalAiAnalysis = aiAnalysis || {
      possibleConditions: [],
      explanation: '',
      recommendations: []
    };
    let finalRiskScore = riskScore !== undefined ? riskScore : 0;
    let finalRiskLevel = riskLevel || 'Pending';

    if (inputForAi && inputForAi.trim()) {
      try {
        const path = require('path');
        const { pathToFileURL } = require('url');
        const apiPath = pathToFileURL(path.resolve(__dirname, '../../API/src/index.js')).href;
        const apiModule = await import(apiPath);
        const aiResult = await apiModule.processReport(inputForAi, {
          species,
          affectedAnimals: Number(affectedAnimals) || 1,
          deaths: Number(deaths) || 0
        });

        if (aiResult.symptoms && aiResult.symptoms.length > 0) {
          finalSymptoms = aiResult.symptoms;
        }
        if (aiResult.aiAnalysis && (Array.isArray(aiResult.aiAnalysis.possibleConditions) || aiResult.aiAnalysis.explanation)) {
          finalAiAnalysis = aiResult.aiAnalysis;
        }
        if (aiResult.riskScore !== undefined && aiResult.riskScore > 0) {
          finalRiskScore = aiResult.riskScore;
        }
        if (aiResult.riskLevel && aiResult.riskLevel !== 'Pending') {
          finalRiskLevel = aiResult.riskLevel;
        }
      } catch (aiErr) {
        console.warn(`[Backend AI Warning] Failed to run AI classification (${aiErr.message})`);
      }
    }

    const assignedVetName = assignedVet || assignedTo || null;

    const caseData = {
      farmerName,
      farmerPhone: farmerPhone || '',
      village,
      species,
      rawInput: rawInput || (typeof symptoms === 'string' ? symptoms : ''),
      symptoms: finalSymptoms,
      affectedAnimals: affectedAnimals !== undefined ? affectedAnimals : 1,
      deaths: deaths !== undefined ? deaths : 0,
      duration: duration || 'Unknown',
      vaccinationStatus: vaccinationStatus || 'Unknown',
      lat: lat !== undefined ? lat : null,
      lng: lng !== undefined ? lng : null,
      aiAnalysis: finalAiAnalysis,
      riskScore: finalRiskScore,
      riskLevel: finalRiskLevel,
      status: status || 'Reported',
      assignedTo: assignedVetName,
      assignedVet: assignedVetName,
      assignedVetId: assignedVetId || null,
      assignedRole: assignedRole || null,
      treatmentNotes: treatmentNotes || '',
      labReferral: Boolean(labReferral),
      labNotes: labNotes || '',
      alertSent: false,
      alertError: null
    };

    // Attempt Twilio SMS alert for High or Critical risk cases
    const upperRisk = (finalRiskLevel || '').toUpperCase();
    if (upperRisk === 'HIGH' || upperRisk === 'CRITICAL') {
      try {
        const alertRes = await sendRiskAlert(caseData);
        if (alertRes.success) {
          caseData.alertSent = true;
        } else {
          caseData.alertError = alertRes.error;
        }
      } catch (smsErr) {
        console.error(`[Backend SMS Failure Log] Twilio alert failed cleanly: ${smsErr.message}`);
        caseData.alertError = smsErr.message;
      }
    }

    if (isDbConnected()) {
      const newCase = new Case(caseData);
      const savedCase = await newCase.save();
      return res.status(201).json({
        success: true,
        message: 'Case created successfully',
        case: savedCase
      });
    } else {
      const now = new Date();
      const id = new mongoose.Types.ObjectId().toString();
      const memoryCase = {
        _id: id,
        id,
        ...caseData,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
      inMemoryCases.unshift(memoryCase);
      return res.status(201).json({
        success: true,
        message: 'Case created successfully',
        case: memoryCase
      });
    }
  } catch (error) {
    next(error);
  }
};

// GET /api/cases
const getCases = async (req, res, next) => {
  try {
    const { farmer, assignedTo, assignedVet, assignedVetId } = req.query;
    const callerUser = req.user;

    // Role-Scoped Filter Enforcement
    if (callerUser && callerUser.role === 'VETERINARIAN') {
      const vId = (callerUser._id ? callerUser._id.toString() : (callerUser.id || '')).trim();
      const vEmpId = (callerUser.employeeId || '').trim();
      const vName = (callerUser.name || '').trim();

      const orConditions = [
        { assignedVet: new RegExp(`^${vName}$`, 'i') },
        { assignedTo: new RegExp(`^${vName}$`, 'i') }
      ];
      if (vId) orConditions.push({ assignedVetId: vId });
      if (vEmpId) orConditions.push({ assignedVetId: vEmpId });

      if (isDbConnected()) {
        const cases = await Case.find({ $or: orConditions }).sort({ createdAt: -1 });
        return res.status(200).json({
          success: true,
          count: cases.length,
          cases
        });
      } else {
        const cases = inMemoryCases.filter((c) => isCaseAssignedToVet(c, callerUser));
        return res.status(200).json({
          success: true,
          count: cases.length,
          cases
        });
      }
    }

    if (callerUser && callerUser.role === 'FARMER') {
      const fPhone = callerUser.phone || '';
      const fName = callerUser.name || '';
      const orConditions = [];
      if (fPhone) orConditions.push({ farmerPhone: fPhone });
      if (fName) orConditions.push({ farmerName: new RegExp(fName, 'i') });

      if (isDbConnected()) {
        const cases = await Case.find(orConditions.length > 0 ? { $or: orConditions } : {}).sort({ createdAt: -1 });
        return res.status(200).json({
          success: true,
          count: cases.length,
          cases
        });
      } else {
        const cases = inMemoryCases.filter((c) => (c.farmerPhone === fPhone) || (fName && (c.farmerName || '').includes(fName)));
        return res.status(200).json({
          success: true,
          count: cases.length,
          cases
        });
      }
    }

    // Admin or general search query
    const targetVet = assignedTo || assignedVet;
    const targetVetId = assignedVetId;

    if (isDbConnected()) {
      let query = {};
      const andConditions = [];

      if (farmer) {
        andConditions.push({
          $or: [
            { farmerName: new RegExp(farmer, 'i') },
            { farmerPhone: new RegExp(farmer, 'i') }
          ]
        });
      }

      if (targetVetId) {
        andConditions.push({ assignedVetId: targetVetId });
      } else if (targetVet) {
        andConditions.push({
          $or: [
            { assignedTo: new RegExp(targetVet, 'i') },
            { assignedVet: new RegExp(targetVet, 'i') }
          ]
        });
      }

      if (andConditions.length > 0) {
        query = { $and: andConditions };
      }

      const cases = await Case.find(query).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: cases.length,
        cases
      });
    } else {
      let results = [...inMemoryCases];
      if (farmer) {
        results = results.filter((c) =>
          (c.farmerName || '').toLowerCase().includes(farmer.toLowerCase()) ||
          (c.farmerPhone || '').includes(farmer)
        );
      }
      if (targetVetId) {
        results = results.filter((c) => c.assignedVetId === targetVetId);
      } else if (targetVet) {
        const s = targetVet.toLowerCase();
        results = results.filter((c) =>
          (c.assignedTo || '').toLowerCase().includes(s) ||
          (c.assignedVet || '').toLowerCase().includes(s)
        );
      }
      return res.status(200).json({
        success: true,
        count: results.length,
        cases: results
      });
    }
  } catch (error) {
    next(error);
  }
};

// GET /api/cases/:id
const getCaseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const callerUser = req.user;

    let foundCase = null;
    if (isDbConnected()) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        foundCase = await Case.findById(id);
      }
      if (!foundCase) {
        foundCase = await Case.findOne({ id: id });
      }
    } else {
      foundCase = inMemoryCases.find((c) => c._id === id || c.id === id);
    }

    if (!foundCase) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Authorization Guard for Veterinarian
    if (callerUser && callerUser.role === 'VETERINARIAN') {
      const allowed = isCaseAssignedToVet(foundCase, callerUser);
      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: This case is not assigned to your veterinarian profile.'
        });
      }
    }

    return res.status(200).json({
      success: true,
      case: foundCase
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/cases/:id
const updateCase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const callerUser = req.user;
    const updatePayload = { ...req.body };

    let existingCase = null;
    if (isDbConnected()) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        existingCase = await Case.findById(id);
      }
      if (!existingCase) {
        existingCase = await Case.findOne({ id: id });
      }
    } else {
      existingCase = inMemoryCases.find((c) => c._id === id || c.id === id);
    }

    if (!existingCase) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Role-Specific Authorization
    if (callerUser && callerUser.role === 'VETERINARIAN') {
      // 1. Must be assigned to this veterinarian
      const allowed = isCaseAssignedToVet(existingCase, callerUser);
      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You cannot modify cases assigned to another veterinarian.'
        });
      }

      // 2. Veterinarians cannot reassign or change assigned veterinarian
      delete updatePayload.assignedVet;
      delete updatePayload.assignedTo;
      delete updatePayload.assignedVetId;
      delete updatePayload.assignedBy;
      delete updatePayload.assignedRole;
      delete updatePayload.assignedAt;
    }

    if (callerUser && callerUser.role === 'ADMIN') {
      // Check if Admin is attempting clinical/diagnostic modifications (strictly forbidden for Admin)
      const hasClinicalAttempt = Boolean(
        updatePayload.investigation !== undefined ||
        (updatePayload.treatmentNotes !== undefined && !updatePayload.assignedVet && !updatePayload.assignedVetId) ||
        (updatePayload.labNotes !== undefined && !updatePayload.assignedVet && !updatePayload.assignedVetId)
      );

      if (hasClinicalAttempt) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Administrators have oversight authority only. Clinical findings, biological sampling, and treatment records may only be recorded by attending veterinarians.'
        });
      }

      // If Admin is assigning a veterinarian, record assignedBy and timestamp
      if (updatePayload.assignedVetId || updatePayload.assignedVet || updatePayload.assignedTo) {
        updatePayload.assignedBy = callerUser.name || (callerUser._id ? callerUser._id.toString() : 'Admin');
        updatePayload.assignedAt = new Date().toISOString();
        if (!updatePayload.status || updatePayload.status === 'Reported') {
          updatePayload.status = 'UNDER_INVESTIGATION';
        }
      }
    }

    if (updatePayload.assignedVet && !updatePayload.assignedTo) {
      updatePayload.assignedTo = updatePayload.assignedVet;
    }
    if (updatePayload.assignedTo && !updatePayload.assignedVet) {
      updatePayload.assignedVet = updatePayload.assignedTo;
    }

    if (isDbConnected()) {
      const targetId = existingCase._id;
      const newRiskLevel = updatePayload.riskLevel || existingCase.riskLevel;
      const upperRisk = (newRiskLevel || '').toUpperCase();
      if ((upperRisk === 'HIGH' || upperRisk === 'CRITICAL') && !existingCase.alertSent) {
        try {
          const alertRes = await sendRiskAlert({ ...existingCase.toObject(), ...updatePayload });
          if (alertRes.success) {
            updatePayload.alertSent = true;
          } else {
            updatePayload.alertError = alertRes.error;
          }
        } catch (smsErr) {
          console.error(`[Backend SMS Failure Log] Twilio alert failed on PATCH: ${smsErr.message}`);
          updatePayload.alertError = smsErr.message;
        }
      }

      const updatedCase = await Case.findByIdAndUpdate(targetId, updatePayload, {
        new: true,
        runValidators: false
      });

      return res.status(200).json({
        success: true,
        message: 'Case updated successfully',
        case: updatedCase
      });
    } else {
      const index = inMemoryCases.findIndex((c) => c._id === id || c.id === id);
      const updated = {
        ...existingCase,
        ...updatePayload,
        updatedAt: new Date().toISOString()
      };
      inMemoryCases[index] = updated;

      return res.status(200).json({
        success: true,
        message: 'Case updated successfully',
        case: updated
      });
    }
  } catch (error) {
    next(error);
  }
};

// POST /api/analyze — Real-time AI symptom extraction & triage preview
const analyzeReport = async (req, res, next) => {
  try {
    const { symptoms, rawInput, species, affectedAnimals, deaths } = req.body;
    const inputForAi = (rawInput && rawInput.trim()) || (typeof symptoms === 'string' ? symptoms : '');

    if (!inputForAi || !inputForAi.trim()) {
      return res.status(400).json({
        success: false,
        message: 'No symptom text provided for analysis'
      });
    }

    const path = require('path');
    const { pathToFileURL } = require('url');
    const apiPath = pathToFileURL(path.resolve(__dirname, '../../API/src/index.js')).href;
    const apiModule = await import(apiPath);

    const aiResult = await apiModule.processReport(inputForAi, {
      species: species || 'Cattle',
      affectedAnimals: Number(affectedAnimals) || 1,
      deaths: Number(deaths) || 0
    });

    return res.status(200).json({
      success: true,
      symptoms: aiResult.symptoms || [],
      aiAnalysis: aiResult.aiAnalysis || {
        possibleConditions: [],
        explanation: '',
        recommendations: []
      },
      riskScore: aiResult.riskScore !== undefined ? aiResult.riskScore : 0,
      riskLevel: aiResult.riskLevel || 'Low',
      breakdown: aiResult.breakdown,
      syndromesDetected: aiResult.syndromesDetected,
      recommendedAction: aiResult.recommendedAction
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  analyzeReport,
  getCases,
  getCaseById,
  updateCase
};
