/**
 * @file index.js
 * @description Main integration entry point for PashuPrahari AI & Rules module.
 * Provides extractSymptoms(), calculateRisk(), and processReport() for Member 2 (Backend).
 */

import { extractSymptoms } from './ai/aiService.js';
import { parseSymptomExtractionResponse, sanitizeJsonResponse } from './ai/aiParser.js';
import {
  SYMPTOM_EXTRACTION_SYSTEM_PROMPT,
  CLINICAL_SYMPTOM_VOCABULARY,
  buildSymptomExtractionUserPrompt
} from './ai/symptomExtractionPrompt.js';
import { calculateRisk, calculateDeathRisk, normalizeSymptomToken, getRiskTier } from './rules/riskEngine.js';
import {
  SYMPTOM_WEIGHTS,
  RISK_THRESHOLDS,
  SYNDROMIC_COMBINATIONS
} from './rules/riskRules.js';

/**
 * Validates and preserves latitude and longitude coordinate values.
 * @param {*} lat 
 * @param {*} lng 
 * @returns {{ lat: number|null|*, lng: number|null|* }}
 */
export function sanitizeCoordinates(lat, lng) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return {
      lat: lat === null ? null : lat,
      lng: lng === null ? null : lng
    };
  }

  if (typeof lat === 'number' && typeof lng === 'number') {
    return { lat, lng };
  }

  const numLat = Number(lat);
  const numLng = Number(lng);

  if (!isNaN(numLat) && !isNaN(numLng) && typeof lat === 'string' && typeof lng === 'string') {
    return { lat: numLat, lng: numLng };
  }

  return { lat, lng };
}

/**
 * Processes a complete Case payload object from frontend/backend.
 * Extracts symptoms from rawText/rawInput, calculates risk, and preserves case metadata and coordinates.
 * 
 * @param {object} casePayload - Case object (farmerName, village, lat, lng, species, rawInput, etc.)
 * @param {object} [options] - Optional AI configuration options
 * @returns {Promise<object>} Complete Case payload enriched with symptoms, aiAnalysis, riskScore, riskLevel, and breakdown.
 */
export async function processCase(casePayload = {}, options = {}) {
  const rawInput = casePayload.rawInput || casePayload.rawText || casePayload.text || (typeof casePayload.symptoms === 'string' ? casePayload.symptoms : '');
  const inputStr = typeof rawInput === 'string' ? rawInput : Array.isArray(rawInput) ? rawInput.join(' ') : '';

  const extractionResult = await extractSymptoms(inputStr, { species: casePayload.species, ...options });
  const symptoms = (extractionResult.symptoms && extractionResult.symptoms.length > 0)
    ? extractionResult.symptoms
    : (Array.isArray(casePayload.symptoms) ? casePayload.symptoms : []);

  const deathsVal = options.deaths !== undefined ? options.deaths : (casePayload.deaths !== undefined ? casePayload.deaths : 0);
  const riskResult = calculateRisk(symptoms, { ...options, deaths: deathsVal });
  const latVal = casePayload.lat !== undefined ? casePayload.lat : casePayload.latitude;
  const lngVal = casePayload.lng !== undefined ? casePayload.lng : casePayload.longitude;
  const coords = sanitizeCoordinates(latVal, lngVal);

  return {
    ...casePayload,
    lat: coords.lat,
    lng: coords.lng,
    rawInput: (inputStr || '').trim(),
    symptoms,
    aiAnalysis: extractionResult.aiAnalysis || {
      possibleConditions: [],
      explanation: '',
      recommendations: []
    },
    riskScore: riskResult.riskScore,
    riskLevel: riskResult.riskLevel,
    breakdown: riskResult.breakdown,
    syndromesDetected: riskResult.syndromesDetected,
    recommendedAction: riskResult.recommendedAction,
    status: casePayload.status || 'Reported',
    _aiMetadata: {
      provider: extractionResult.provider,
      aiSuccess: extractionResult.success,
      ...(extractionResult.error ? { aiError: extractionResult.error } : {})
    }
  };
}

/**
 * High-level pipeline helper for processing a raw veterinary report or case object.
 * 
 * @param {string|object} input - Raw text string OR full case payload object
 * @param {object} [options] - Optional AI service configurations
 * @returns {Promise<object>}
 */
export async function processReport(input, options = {}) {
  if (typeof input === 'object' && input !== null) {
    return processCase(input, options);
  }

  const rawText = typeof input === 'string' ? input : '';
  const extractionResult = await extractSymptoms(rawText, options);
  const symptoms = extractionResult.symptoms || [];

  const deathsVal = options.deaths !== undefined ? options.deaths : 0;
  const riskResult = calculateRisk(symptoms, { ...options, deaths: deathsVal });

  return {
    rawText: (rawText || '').trim(),
    symptoms,
    aiAnalysis: extractionResult.aiAnalysis || {
      possibleConditions: [],
      explanation: '',
      recommendations: []
    },
    riskScore: riskResult.riskScore,
    riskLevel: riskResult.riskLevel,
    breakdown: riskResult.breakdown,
    syndromesDetected: riskResult.syndromesDetected,
    recommendedAction: riskResult.recommendedAction,
    status: 'Reported',
    _aiMetadata: {
      provider: extractionResult.provider,
      aiSuccess: extractionResult.success,
      ...(extractionResult.error ? { aiError: extractionResult.error } : {})
    }
  };
}

// Named exports
export {
  // AI Layer
  extractSymptoms,
  parseSymptomExtractionResponse,
  sanitizeJsonResponse,
  SYMPTOM_EXTRACTION_SYSTEM_PROMPT,
  CLINICAL_SYMPTOM_VOCABULARY,
  buildSymptomExtractionUserPrompt,

  // Rule Engine
  calculateRisk,
  calculateDeathRisk,
  normalizeSymptomToken,
  getRiskTier,
  SYMPTOM_WEIGHTS,
  RISK_THRESHOLDS,
  SYNDROMIC_COMBINATIONS
};

// Default export
export default {
  extractSymptoms,
  calculateRisk,
  calculateDeathRisk,
  processReport,
  processCase,
  sanitizeCoordinates,
  SYMPTOM_WEIGHTS,
  RISK_THRESHOLDS
};

