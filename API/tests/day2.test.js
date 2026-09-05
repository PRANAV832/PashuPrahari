/**
 * @file day2.test.js
 * @description Automated test suite for Day 2 / Phase 2 deliverables:
 * - Refined vernacular AI symptom extraction (code-switching, questions, negations, duplicates)
 * - Finalized presentation-ready risk breakdown
 * - Geospatial coordinate preservation
 * - End-to-End Case pipeline integration
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { extractSymptoms } from '../src/ai/aiService.js';
import { calculateRisk, getRiskTier } from '../src/rules/riskEngine.js';
import { processReport, processCase, sanitizeCoordinates } from '../src/index.js';

test('Day 2 — AI Vernacular Extraction & Negative Constraints', async (t) => {

  await t.test('1. Hindi / Hinglish: "Meri cow ko fever hai aur pair mein blisters hain."', async () => {
    const res = await extractSymptoms('Meri cow ko fever hai aur pair mein blisters hain.');
    assert.equal(res.symptoms.includes('Fever'), true);
    assert.equal(res.symptoms.includes('Blisters'), true);
  });

  await t.test('2. Marathi: "माझ्या गायीला ताप आहे आणि पायावर फोड आले आहेत."', async () => {
    const res = await extractSymptoms('माझ्या गायीला ताप आहे आणि पायावर फोड आले आहेत.');
    assert.equal(res.symptoms.includes('Fever'), true);
    assert.equal(res.symptoms.includes('Blisters'), true);
  });

  await t.test('3. Marathi-English Code-Switch: "माझ्या cow ला fever आहे आणि ती properly walk करत नाही."', async () => {
    const res = await extractSymptoms('माझ्या cow ला fever आहे आणि ती properly walk करत नाही.');
    assert.equal(res.symptoms.includes('Fever'), true);
    assert.equal(res.symptoms.includes('Lameness'), true);
  });

  await t.test('4. Transliteration: "gai ko bukhar hai aur khana nahi kha rahi"', async () => {
    const res = await extractSymptoms('gai ko bukhar hai aur khana nahi kha rahi');
    assert.equal(res.symptoms.includes('Fever'), true);
    assert.equal(res.symptoms.includes('Loss of Appetite'), true);
  });

  await t.test('5. Negation: "meri gaay ko fever nahi hai"', async () => {
    const res = await extractSymptoms('meri gaay ko fever nahi hai');
    assert.deepEqual(res.symptoms, []);
  });

  await t.test('6. Question / Hypothetical: "kya fever hone par doctor ko bulana chahiye?"', async () => {
    const res = await extractSymptoms('kya fever hone par doctor ko bulana chahiye?');
    assert.deepEqual(res.symptoms, []);
  });

  await t.test('7. No symptoms / Healthy: "meri gaay bilkul healthy hai aur normally kha rahi hai"', async () => {
    const res = await extractSymptoms('meri gaay bilkul healthy hai aur normally kha rahi hai');
    assert.deepEqual(res.symptoms, []);
  });

  await t.test('8. Multiple Symptoms: "fever, cough, weakness, loss of appetite aur walking mein problem hai"', async () => {
    const res = await extractSymptoms('fever, cough, weakness, loss of appetite aur walking mein problem hai');
    assert.equal(res.symptoms.includes('Fever'), true);
    assert.equal(res.symptoms.includes('Cough'), true);
    assert.equal(res.symptoms.includes('Lethargy'), true);
    assert.equal(res.symptoms.includes('Loss of Appetite'), true);
    assert.equal(res.symptoms.includes('Lameness'), true);
  });

  await t.test('9. Duplicate Wording: "fever hai, bahut fever hai, temperature bhi high hai"', async () => {
    const res = await extractSymptoms('fever hai, bahut fever hai, temperature bhi high hai');
    assert.deepEqual(res.symptoms, ['Fever']);
  });

  await t.test('10. Irrelevant Conversation: "mera naam Ramesh hai aur main Bhiwandi mein rehta hoon"', async () => {
    const res = await extractSymptoms('mera naam Ramesh hai aur main Bhiwandi mein rehta hoon');
    assert.deepEqual(res.symptoms, []);
  });
});

test('Day 2 — Risk Engine Scoring & Presentation Breakdown', async (t) => {

  await t.test('1. Empty symptoms []', () => {
    const res = calculateRisk([]);
    assert.equal(res.riskScore, 0);
    assert.equal(res.riskLevel, 'Low');
    assert.deepEqual(res.breakdown, []);
  });

  await t.test('2. Single symptom ["Fever"]', () => {
    const res = calculateRisk(['Fever']);
    assert.equal(res.riskScore, 35);
    assert.equal(res.riskLevel, 'Moderate');
  });

  await t.test('3. High-impact symptom ["Blisters"]', () => {
    const res = calculateRisk(['Blisters']);
    assert.equal(res.riskScore, 50);
    assert.equal(res.riskLevel, 'Moderate');
  });

  await t.test('4. Syndromic pair ["Fever", "Blisters"]', () => {
    const res = calculateRisk(['Fever', 'Blisters']);
    assert.equal(res.riskScore, 85);
    assert.equal(res.riskLevel, 'High');
    assert.equal(res.breakdown.length, 2);
  });

  await t.test('5. Multi-symptom cluster ["Fever", "Cough", "Weakness"]', () => {
    const res = calculateRisk(['Fever', 'Cough', 'Weakness']);
    assert.equal(res.riskScore, 70);
    assert.equal(res.riskLevel, 'High');
    assert.equal(res.breakdown.length, 3);
  });

  await t.test('6. Duplicate symptoms ["Fever", "Fever", "Blisters"]', () => {
    const res = calculateRisk(['Fever', 'Fever', 'Blisters']);
    assert.equal(res.riskScore, 85);
    assert.equal(res.riskLevel, 'High');
    assert.equal(res.breakdown.length, 2);
  });

  await t.test('7. Unknown symptom ["UnknownSymptom"]', () => {
    const res = calculateRisk(['UnknownSymptom']);
    assert.equal(res.riskScore, 5);
    assert.equal(res.riskLevel, 'Low');
  });

  await t.test('8. Mixed known + unknown ["Fever", "UnknownSymptom", "Blisters"]', () => {
    const res = calculateRisk(['Fever', 'UnknownSymptom', 'Blisters']);
    assert.equal(res.riskScore, 90);
    assert.equal(res.riskLevel, 'Critical');
    assert.equal(res.breakdown.length, 3);
  });

  await t.test('9. Large symptom array capped at 100', () => {
    const largeList = ['Fever', 'Cough', 'Blisters', 'Weakness', 'Loss of Appetite', 'Difficulty Walking', 'Diarrhea', 'Bleeding', 'Respiratory Distress'];
    const res = calculateRisk(largeList);
    assert.equal(res.riskScore, 100);
    assert.equal(res.riskLevel, 'Critical');
  });
});

test('Day 2 — Geospatial Coordinate Flow & Case Contract', async (t) => {

  await t.test('Valid coordinates remain exact numeric values', async () => {
    const inputCase = {
      farmerName: 'Ramesh Patil',
      village: 'Anjeer Phata, Bhiwandi',
      lat: 19.3002,
      lng: 73.0597,
      species: 'Bovine',
      rawText: 'Meri gaay ko bukhar hai aur pair mein chale hain.'
    };

    const res = await processCase(inputCase);
    assert.strictEqual(res.lat, 19.3002);
    assert.strictEqual(res.lng, 73.0597);
    assert.equal(typeof res.lat, 'number');
    assert.equal(typeof res.lng, 'number');
    assert.equal(res.farmerName, 'Ramesh Patil');
    assert.equal(res.village, 'Anjeer Phata, Bhiwandi');
    assert.equal(res.species, 'Bovine');
    assert.equal(res.riskScore, 85);
    assert.equal(res.riskLevel, 'High');
    assert.equal(res.status, 'Reported');
  });

  await t.test('Another valid location coordinates preserved', async () => {
    const inputCase = {
      lat: 19.2183,
      lng: 72.9781,
      rawText: 'Gaay ko bukhar hai'
    };

    const res = await processCase(inputCase);
    assert.strictEqual(res.lat, 19.2183);
    assert.strictEqual(res.lng, 72.9781);
  });

  await t.test('Missing coordinates (null, null) handled safely without crash', async () => {
    const inputCase = {
      lat: null,
      lng: null,
      rawText: 'Gaay ko bukhar hai'
    };

    const res = await processCase(inputCase);
    assert.strictEqual(res.lat, null);
    assert.strictEqual(res.lng, null);
    assert.equal(res.riskScore, 35);
  });

  await t.test('Invalid non-numeric coordinates handled safely without generating fake GPS', async () => {
    const inputCase = {
      lat: 'abc',
      lng: 'xyz',
      rawText: 'Gaay ko bukhar hai'
    };

    const res = await processCase(inputCase);
    assert.strictEqual(res.lat, 'abc');
    assert.strictEqual(res.lng, 'xyz');
    assert.equal(res.riskScore, 35);
  });
});

test('Day 2 — Complete End-to-End Case Pipeline Verification', async () => {
  const inputCase = {
    farmerName: 'Suresh More',
    village: 'Padgha, Thane',
    lat: 19.3002,
    lng: 73.0597,
    species: 'Bovine',
    rawText: 'Meri cow ko fever hai aur pair mein chale hain. Woh khana bhi kam kha rahi hai.'
  };

  const processed = await processCase(inputCase);

  assert.strictEqual(processed.lat, 19.3002);
  assert.strictEqual(processed.lng, 73.0597);
  assert.equal(processed.symptoms.includes('Fever'), true);
  assert.equal(processed.symptoms.includes('Blisters'), true);
  assert.equal(processed.symptoms.includes('Loss of Appetite'), true);
  assert.equal(typeof processed.riskScore, 'number');
  assert.ok(processed.riskScore >= 85 && processed.riskScore <= 100);
  assert.ok(['High', 'Critical'].includes(processed.riskLevel));
  assert.ok(Array.isArray(processed.breakdown));
  assert.equal(processed.breakdown.length, 3);
  assert.equal(processed.farmerName, 'Suresh More');
  assert.equal(processed.village, 'Padgha, Thane');
  assert.equal(processed.species, 'Bovine');
  assert.equal(processed.status, 'Reported');
});
