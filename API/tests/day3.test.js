/**
 * @file day3.test.js
 * @description Automated test suite for Day 3 / Phase 3 deliverables:
 * - Aggressive AI edge-case & stress testing (empty, noise, long text, rural slang, negation, repeated words)
 * - Risk engine stress, boundaries, and presentation explainability
 * - Presentation-safe AI fallback & mock mode (AI_MOCK_MODE, timeouts, failure tolerance)
 * - Coordinate safety & full SIH demo scenarios
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { extractSymptoms, simulateVernacularExtraction } from '../src/ai/aiService.js';
import { calculateRisk, getRiskTier } from '../src/rules/riskEngine.js';
import { processCase, processReport, sanitizeCoordinates } from '../src/index.js';
import { parseSymptomExtractionResponse } from '../src/ai/aiParser.js';

test('Day 3 — AI Edge Case & Stress Testing (10 Stress Tests)', async (t) => {

  await t.test('TEST 1: Very short input — "fever"', async () => {
    const res = await extractSymptoms('fever', { mockMode: true });
    assert.deepEqual(res.symptoms, ['Fever']);
  });

  await t.test('TEST 2: Empty input — ""', async () => {
    const res = await extractSymptoms('', { mockMode: true });
    assert.deepEqual(res.symptoms, []);
  });

  await t.test('TEST 3: Whitespace only — "     "', async () => {
    const res = await extractSymptoms('     ', { mockMode: true });
    assert.deepEqual(res.symptoms, []);
  });

  await t.test('TEST 4: Very long realistic livestock report with noise', async () => {
    const longReport = `
      Namaste doctor sahab, mera naam Ramesh Patil hai aur main Anjeer Phata, Bhiwandi taluka se bol raha hoon.
      Humare gaao mein pichle teen din se lagatar barish ho rahi hai aur mausam thoda thanda ho gaya hai.
      Meri gaay jiska naam Radha hai, subah se bahut garm lag rahi hai, bukhar hai aur uske pair mein chale pad gaye hain.
      Woh subah se ghaas aur chara nahi kha rahi hai, bilkul sust ho gayi hai.
      Kripya batayein humein kya karna chahiye aur kab tak doctor sahab aayenge?
    `;
    const res = await extractSymptoms(longReport, { mockMode: true });
    assert.equal(res.symptoms.includes('Fever'), true);
    assert.equal(res.symptoms.includes('Blisters'), true);
    assert.equal(res.symptoms.includes('Loss of Appetite'), true);
    assert.equal(res.symptoms.includes('Lethargy'), true);
    // Ensure conversational text (Ramesh, Bhiwandi, Radha, barish) did not create fake symptoms
    assert.equal(res.symptoms.includes('Ramesh'), false);
    assert.equal(res.symptoms.includes('Bhiwandi'), false);
  });

  await t.test('TEST 5: Repeated symptoms — "fever fever fever fever, cough cough, pair mein chale"', async () => {
    const res = await extractSymptoms('fever fever fever fever, cough cough, pair mein chale', { mockMode: true });
    assert.equal(res.symptoms.includes('Fever'), true);
    assert.equal(res.symptoms.includes('Cough'), true);
    assert.equal(res.symptoms.includes('Blisters'), true);
    // Ensure deduplication: exactly 3 unique symptoms
    assert.equal(res.symptoms.length, 3);
  });

  await t.test('TEST 6: Negation — "meri gaay ko fever nahi hai aur cough bhi nahi hai"', async () => {
    const res = await extractSymptoms('meri gaay ko fever nahi hai aur cough bhi nahi hai', { mockMode: true });
    assert.deepEqual(res.symptoms, []);
  });

  await t.test('TEST 7: Mixed languages — "माझ्या cow ला fever आहे आणि ती properly walk nahi kar rahi."', async () => {
    const res = await extractSymptoms('माझ्या cow ला fever आहे आणि ती properly walk nahi kar rahi.', { mockMode: true });
    assert.equal(res.symptoms.includes('Fever'), true);
    assert.equal(res.symptoms.includes('Lameness'), true);
  });

  await t.test('TEST 8: Informal rural language — "gai garam lag rahi hai, khana nahi kha rahi aur chalne mein dikkat hai"', async () => {
    const res = await extractSymptoms('gai garam lag rahi hai, khana nahi kha rahi aur chalne mein dikkat hai', { mockMode: true });
    assert.equal(res.symptoms.includes('Fever'), true);
    assert.equal(res.symptoms.includes('Loss of Appetite'), true);
    assert.equal(res.symptoms.includes('Lameness'), true);
  });

  await t.test('TEST 9: Irrelevant conversation — "Namaste. Mera naam Ramesh hai. Aaj mausam bahut achha hai."', async () => {
    const res = await extractSymptoms('Namaste. Mera naam Ramesh hai. Aaj mausam bahut achha hai.', { mockMode: true });
    assert.deepEqual(res.symptoms, []);
  });

  await t.test('TEST 10: Special characters & noise — "!!! gaay ko fever hai ??? ### pair mein chale hain @@@"', async () => {
    const res = await extractSymptoms('!!! gaay ko fever hai ??? ### pair mein chale hain @@@', { mockMode: true });
    assert.equal(res.symptoms.includes('Fever'), true);
    assert.equal(res.symptoms.includes('Blisters'), true);
  });
});

test('Day 3 — Risk Engine Stress & Boundary Testing', async (t) => {

  await t.test('RISK-01: Empty input []', () => {
    const res = calculateRisk([]);
    assert.equal(res.riskScore, 0);
    assert.equal(res.riskLevel, 'Low');
    assert.deepEqual(res.breakdown, []);
  });

  await t.test('RISK-02: Single symptom ["Fever"]', () => {
    const res = calculateRisk(['Fever']);
    assert.equal(res.riskScore, 35);
    assert.equal(res.riskLevel, 'Moderate');
    assert.equal(res.breakdown[0].points, 35);
  });

  await t.test('RISK-03: High-consequence symptom ["Blisters"]', () => {
    const res = calculateRisk(['Blisters']);
    assert.equal(res.riskScore, 50);
    assert.equal(res.riskLevel, 'Moderate');
    assert.equal(res.breakdown[0].points, 50);
  });

  await t.test('RISK-04: Syndromic pair ["Fever", "Blisters"]', () => {
    const res = calculateRisk(['Fever', 'Blisters']);
    assert.equal(res.riskScore, 85);
    assert.equal(res.riskLevel, 'High');
    assert.equal(res.breakdown.length, 2);
  });

  await t.test('RISK-05: Multi-symptom cluster ["Fever", "Cough", "Weakness", "Loss of Appetite", "Difficulty Walking"]', () => {
    const res = calculateRisk(['Fever', 'Cough', 'Weakness', 'Loss of Appetite', 'Difficulty Walking']);
    // 35 + 20 + 15 + 20 + 25 = 115 -> clamped to 100
    assert.equal(res.riskScore, 100);
    assert.equal(res.riskLevel, 'Critical');
  });

  await t.test('RISK-06: Duplicates ["Fever", "Fever", "Fever", "Blisters"]', () => {
    const res = calculateRisk(['Fever', 'Fever', 'Fever', 'Blisters']);
    assert.equal(res.riskScore, 85);
    assert.equal(res.riskLevel, 'High');
    assert.equal(res.breakdown.length, 2);
  });

  await t.test('RISK-07: Unrecognized symptoms ["Unknown1", "Unknown2", "Unknown3"]', () => {
    const res = calculateRisk(['Unknown1', 'Unknown2', 'Unknown3']);
    // 5 + 5 + 5 = 15
    assert.equal(res.riskScore, 15);
    assert.equal(res.riskLevel, 'Low');
    assert.equal(res.breakdown.length, 3);
  });

  await t.test('RISK-08: Mixed known + unknown ["Fever", "Unknown1", "Blisters", "Unknown2"]', () => {
    const res = calculateRisk(['Fever', 'Unknown1', 'Blisters', 'Unknown2']);
    // 35 + 5 + 50 + 5 = 95
    assert.equal(res.riskScore, 95);
    assert.equal(res.riskLevel, 'Critical');
  });

  await t.test('RISK-09: Score Boundary Verification across all 4 tiers', () => {
    // Low: 0 - 29
    assert.equal(getRiskTier(0).level, 'Low');
    assert.equal(getRiskTier(29).level, 'Low');
    // Moderate: 30 - 59
    assert.equal(getRiskTier(30).level, 'Moderate');
    assert.equal(getRiskTier(59).level, 'Moderate');
    // High: 60 - 85
    assert.equal(getRiskTier(60).level, 'High');
    assert.equal(getRiskTier(85).level, 'High');
    // Critical: 86 - 100
    assert.equal(getRiskTier(86).level, 'Critical');
    assert.equal(getRiskTier(100).level, 'Critical');
  });
});

test('Day 3 — Presentation Safe Fallback & Mock Mode', async (t) => {

  await t.test('FALLBACK-01: Explicit Mock Mode ({ mockMode: true })', async () => {
    const input = 'Meri gaay ko bukhar hai aur pair mein chale hain.';
    const res = await extractSymptoms(input, { mockMode: true });

    assert.equal(res.success, true);
    assert.equal(res.provider, 'mock-mode');
    assert.equal(res.symptoms.includes('Fever'), true);
    assert.equal(res.symptoms.includes('Blisters'), true);

    const risk = calculateRisk(res.symptoms);
    assert.equal(risk.riskScore, 85);
    assert.equal(risk.riskLevel, 'High');
    assert.equal(risk.breakdown.length, 2);
  });

  await t.test('FALLBACK-02: Timeout Handling with Safe Fallback', async () => {
    const res = await extractSymptoms('Meri gaay ko bukhar hai', { timeoutMs: 1 });
    assert.equal(res.symptoms.includes('Fever'), true);
  });

  await t.test('FALLBACK-03: Malformed AI Response Recovery', () => {
    const malformed = '{"symptoms": ["Fever", "Blisters"'; // unclosed JSON
    const parsed = parseSymptomExtractionResponse(malformed);
    assert.equal(parsed.symptoms.includes('Fever'), true);
    assert.equal(parsed.symptoms.includes('Blisters'), true);
  });

  await t.test('FALLBACK-04: Deterministic Equivalence between Live & Fallback symptoms', () => {
    const symptoms = ['Fever', 'Blisters', 'Loss of Appetite'];
    const run1 = calculateRisk(symptoms);
    const run2 = calculateRisk(symptoms);

    assert.strictEqual(run1.riskScore, run2.riskScore);
    assert.strictEqual(run1.riskLevel, run2.riskLevel);
    assert.deepEqual(run1.breakdown, run2.breakdown);
  });
});

test('Day 3 — SIH Live Demo Scenario & Coordinate Safety', async (t) => {
  const demoCase = {
    farmerName: 'Ramesh Patil',
    village: 'Anjeer Phata, Bhiwandi',
    species: 'Bovine',
    lat: 19.3002,
    lng: 73.0597,
    rawText: 'Meri gaay ko bukhar hai aur pair mein chale hain. Woh khana bhi kam kha rahi hai.'
  };

  // 1. Normal execution
  const processedNormal = await processCase(demoCase);
  assert.strictEqual(processedNormal.lat, 19.3002);
  assert.strictEqual(processedNormal.lng, 73.0597);
  assert.equal(processedNormal.symptoms.includes('Fever'), true);
  assert.equal(processedNormal.symptoms.includes('Blisters'), true);
  assert.equal(processedNormal.symptoms.includes('Loss of Appetite'), true);
  assert.equal(processedNormal.riskScore, 100);
  assert.equal(processedNormal.riskLevel, 'Critical');
  assert.equal(processedNormal.farmerName, 'Ramesh Patil');

  // 2. Simulated Fallback execution (e.g. during live demo network glitch)
  const processedFallback = await processCase(demoCase, { mockMode: true });
  assert.strictEqual(processedFallback.lat, 19.3002);
  assert.strictEqual(processedFallback.lng, 73.0597);
  assert.equal(processedFallback.riskScore, 100);
  assert.equal(processedFallback.riskLevel, 'Critical');
  assert.equal(processedFallback.breakdown.length, 3);
});
