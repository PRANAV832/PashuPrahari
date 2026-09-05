/**
 * @file riskEngine.js
 * @description Deterministic, transparent, and explainable rule-based risk calculation engine.
 * Computes 0–100 risk scores and PRD-compliant risk tiers without external LLM dependencies.
 */

import {
  SYMPTOM_WEIGHTS,
  DEFAULT_UNKNOWN_SYMPTOM_WEIGHT,
  SYNDROMIC_COMBINATIONS,
  RISK_THRESHOLDS,
  SYMPTOM_ALIASES
} from './riskRules.js';

/**
 * Normalizes a symptom string using alias maps and standard casing.
 * @param {string} symptom
 * @returns {string} Standardized token
 */
export function normalizeSymptomToken(symptom) {
  if (typeof symptom !== 'string') return '';
  const trimmed = symptom.trim();
  const lower = trimmed.toLowerCase();

  if (SYMPTOM_ALIASES[lower]) {
    return SYMPTOM_ALIASES[lower];
  }

  // Exact match search in weights
  const exactKey = Object.keys(SYMPTOM_WEIGHTS).find(
    (k) => k.toLowerCase() === lower
  );

  if (exactKey) {
    return exactKey;
  }

  // Capitalize first letter of unknown symptom
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Maps a numeric risk score (0-100) to its corresponding categorical tier.
 * @param {number} score
 * @returns {{ level: 'Low'|'Moderate'|'High'|'Critical', color: string, action: string }}
 */
export function getRiskTier(score) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  for (const tier of RISK_THRESHOLDS) {
    if (clampedScore >= tier.min && clampedScore <= tier.max) {
      return {
        level: tier.level,
        color: tier.color,
        action: tier.action
      };
    }
  }

  return {
    level: 'Low',
    color: '#16A34A',
    action: 'Standard home advisory & observation'
  };
}

/**
 * Calculates additional risk points based on livestock deaths.
 * 0 deaths -> 0 pts
 * 1 death  -> 15 pts
 * 2 deaths -> 25 pts
 * 3 deaths -> 35 pts
 * 4 deaths -> 45 pts
 * 5 deaths -> 55 pts
 * 6+ deaths -> 55 + (deaths - 5) * 5 (capped at 85 pts max)
 *
 * @param {number|string} deaths
 * @returns {number}
 */
export function calculateDeathRisk(deaths) {
  let count = 0;
  if (deaths !== null && deaths !== undefined) {
    const parsed = Number(deaths);
    if (!isNaN(parsed) && isFinite(parsed) && parsed > 0) {
      count = Math.floor(parsed);
    }
  }

  if (count <= 0) return 0;

  if (count === 1) return 15;
  if (count === 2) return 25;
  if (count === 3) return 35;
  if (count === 4) return 45;
  if (count === 5) return 55;

  const baseForFive = 55;
  const additional = (count - 5) * 5;
  return Math.min(85, baseForFive + additional);
}

/**
 * Calculates deterministic risk score and breakdown for a list of symptoms and livestock deaths.
 * 
 * @param {Array<string>} symptoms - List of observed clinical symptom tokens
 * @param {object|number} [optionsOrDeaths] - Options object containing { deaths, ... } OR numeric death count
 * @returns {{
 *   riskScore: number,
 *   riskLevel: 'Low'|'Moderate'|'High'|'Critical',
 *   breakdown: Array<{ symptom: string, weight: number, points: number, category: string, description: string }>,
 *   syndromesDetected: Array<{ name: string, alertDescription: string, bonusPoints: number }>,
 *   recommendedAction: string
 * }}
 */
export function calculateRisk(symptoms, optionsOrDeaths = 0) {
  let deathsVal = 0;
  if (typeof optionsOrDeaths === 'number') {
    deathsVal = optionsOrDeaths;
  } else if (typeof optionsOrDeaths === 'object' && optionsOrDeaths !== null) {
    deathsVal = optionsOrDeaths.deaths !== undefined
      ? optionsOrDeaths.deaths
      : (optionsOrDeaths.numberOfDeaths || 0);
  }

  const deathPoints = calculateDeathRisk(deathsVal);

  const hasSymptoms = Array.isArray(symptoms) && symptoms.length > 0;

  // 1. Deduplicate & normalize symptoms
  const normalizedSet = new Set();
  if (hasSymptoms) {
    for (const sym of symptoms) {
      const normalized = normalizeSymptomToken(sym);
      if (normalized) {
        normalizedSet.add(normalized);
      }
    }
  }

  const uniqueSymptoms = Array.from(normalizedSet);
  let rawScore = 0;
  const breakdown = [];

  // 2. Score individual symptoms
  for (const symptom of uniqueSymptoms) {
    const rule = SYMPTOM_WEIGHTS[symptom];

    if (rule) {
      rawScore += rule.weight;
      breakdown.push({
        symptom,
        points: rule.weight,
        weight: rule.weight,
        category: rule.category,
        reason: rule.description,
        description: rule.description
      });
    } else {
      // Unknown symptom: safe minimal weight assignment
      rawScore += DEFAULT_UNKNOWN_SYMPTOM_WEIGHT;
      breakdown.push({
        symptom,
        points: DEFAULT_UNKNOWN_SYMPTOM_WEIGHT,
        weight: DEFAULT_UNKNOWN_SYMPTOM_WEIGHT,
        category: 'Unclassified',
        reason: 'Unclassified symptom observation (minimal baseline weight applied)',
        description: 'Unclassified symptom observation'
      });
    }
  }

  // 3. Check for Syndromic Combinations
  const syndromesDetected = [];
  for (const combo of SYNDROMIC_COMBINATIONS) {
    const hasAll = combo.requiredSymptoms.every((req) =>
      uniqueSymptoms.includes(req)
    );

    if (hasAll) {
      rawScore += combo.bonusPoints;
      syndromesDetected.push({
        name: combo.name,
        alertDescription: combo.alertDescription,
        bonusPoints: combo.bonusPoints
      });
    }
  }

  // 4. Add Death Risk Contribution
  if (deathPoints > 0) {
    const safeDeathsCount = Math.floor(Math.max(0, Number(deathsVal) || 0));
    rawScore += deathPoints;
    breakdown.push({
      symptom: 'Livestock Deaths',
      points: deathPoints,
      weight: deathPoints,
      category: 'Fatality / Mortality',
      reason: `Elevated mortality risk contribution (${safeDeathsCount} livestock death${safeDeathsCount > 1 ? 's' : ''} reported)`,
      description: `Elevated mortality risk contribution (${safeDeathsCount} livestock death${safeDeathsCount > 1 ? 's' : ''} reported)`
    });
  }

  // 5. Clamp score strictly to [0, 100]
  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));
  const tier = getRiskTier(finalScore);

  return {
    riskScore: finalScore,
    riskLevel: tier.level,
    breakdown,
    syndromesDetected,
    recommendedAction: tier.action
  };
}
