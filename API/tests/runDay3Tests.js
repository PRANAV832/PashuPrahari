/**
 * @file runDay3Tests.js
 * @description Comprehensive Day 3 test runner executing all stress tests, fallback tests, and demo scenarios.
 */

import { extractSymptoms } from '../src/ai/aiService.js';
import { calculateRisk, getRiskTier } from '../src/rules/riskEngine.js';
import { processCase, processReport } from '../src/index.js';
import { SYMPTOM_WEIGHTS, RISK_THRESHOLDS } from '../src/rules/riskRules.js';

async function runDay3Evaluation() {
  console.log('='.repeat(80));
  console.log('PASHUPRAHARI — MEMBER 3 (DAY 3 / PHASE 3) COMPREHENSIVE TEST SUITE');
  console.log('='.repeat(80));

  const stats = {
    aiPassed: 0,
    aiFailed: 0,
    riskPassed: 0,
    riskFailed: 0,
    boundaryPassed: 0,
    boundaryFailed: 0,
    jsonPassed: 0,
    jsonFailed: 0,
    coordPassed: 0,
    coordFailed: 0,
    integPassed: 0,
    integFailed: 0
  };

  // --- 1. AI STRESS TESTS (10 Cases) ---
  console.log('\n--- 1. AI AGGRESSIVE STRESS TESTS (10 Cases) ---');
  const aiStressCases = [
    { id: 'STRESS-01', name: 'Very Short Input', input: 'fever', expect: ['Fever'], empty: false },
    { id: 'STRESS-02', name: 'Empty Input', input: '', expect: [], empty: true },
    { id: 'STRESS-03', name: 'Whitespace Only', input: '     ', expect: [], empty: true },
    {
      id: 'STRESS-04',
      name: 'Very Long Realistic Report',
      input: 'Namaste doctor sahab, mera naam Ramesh Patil hai aur main Bhiwandi se bol raha hoon. Barish ho rahi hai. Meri gaay Radha subah se garm lag rahi hai, bukhar hai aur uske pair mein chale hain, khana nahi kha rahi aur sust ho gayi hai.',
      expect: ['Fever', 'Blisters', 'Loss of Appetite', 'Lethargy'],
      empty: false
    },
    { id: 'STRESS-05', name: 'Repeated Symptoms', input: 'fever fever fever fever, cough cough, pair mein chale', expect: ['Fever', 'Cough', 'Blisters'], empty: false },
    { id: 'STRESS-06', name: 'Negation', input: 'meri gaay ko fever nahi hai aur cough bhi nahi hai', expect: [], empty: true },
    { id: 'STRESS-07', name: 'Mixed Languages (Marathi+English)', input: 'माझ्या cow ला fever आहे आणि ती properly walk nahi kar rahi.', expect: ['Fever', 'Lameness'], empty: false },
    { id: 'STRESS-08', name: 'Informal Rural Slang', input: 'gai garam lag rahi hai, khana nahi kha rahi aur chalne mein dikkat hai', expect: ['Fever', 'Loss of Appetite', 'Lameness'], empty: false },
    { id: 'STRESS-09', name: 'Irrelevant Conversation', input: 'Namaste. Mera naam Ramesh hai. Aaj mausam bahut achha hai.', expect: [], empty: true },
    { id: 'STRESS-10', name: 'Special Characters & Noise', input: '!!! gaay ko fever hai ??? ### pair mein chale hain @@@', expect: ['Fever', 'Blisters'], empty: false }
  ];

  for (const sc of aiStressCases) {
    const res = await extractSymptoms(sc.input, { mockMode: true });
    const symptoms = res.symptoms || [];
    let pass = true;

    if (sc.empty) {
      pass = symptoms.length === 0;
    } else {
      pass = sc.expect.every(e => symptoms.includes(e));
    }

    if (pass) stats.aiPassed++; else stats.aiFailed++;
    console.log(`[${sc.id}] ${sc.name.padEnd(32)} -> Symptoms: ${JSON.stringify(symptoms)} | ${pass ? 'PASS' : 'FAIL'}`);
  }

  // --- 2. RISK ENGINE STRESS TESTS (9 Cases) ---
  console.log('\n--- 2. RISK ENGINE STRESS TESTS ---');
  const riskCases = [
    { id: 'RISK-01', input: [], expectScore: 0, expectTier: 'Low' },
    { id: 'RISK-02', input: ['Fever'], expectScore: 35, expectTier: 'Moderate' },
    { id: 'RISK-03', input: ['Blisters'], expectScore: 50, expectTier: 'Moderate' },
    { id: 'RISK-04', input: ['Fever', 'Blisters'], expectScore: 85, expectTier: 'High' },
    { id: 'RISK-05', input: ['Fever', 'Cough', 'Weakness', 'Loss of Appetite', 'Difficulty Walking'], expectScore: 100, expectTier: 'Critical' },
    { id: 'RISK-06', input: ['Fever', 'Fever', 'Fever', 'Blisters'], expectScore: 85, expectTier: 'High' },
    { id: 'RISK-07', input: ['Unknown1', 'Unknown2', 'Unknown3'], expectScore: 15, expectTier: 'Low' },
    { id: 'RISK-08', input: ['Fever', 'Unknown1', 'Blisters', 'Unknown2'], expectScore: 95, expectTier: 'Critical' },
    { id: 'RISK-09', input: ['Fever', 'Cough', 'Blisters', 'Weakness', 'Loss of Appetite', 'Difficulty Walking', 'Diarrhea', 'Bleeding', 'Respiratory Distress'], expectScore: 100, expectTier: 'Critical' }
  ];

  for (const rc of riskCases) {
    const res = calculateRisk(rc.input);
    const pass = res.riskScore === rc.expectScore && res.riskLevel === rc.expectTier && Array.isArray(res.breakdown);
    if (pass) stats.riskPassed++; else stats.riskFailed++;
    console.log(`[${rc.id}] Input: ${JSON.stringify(rc.input).padEnd(50)} -> Score: ${res.riskScore}/100 [${res.riskLevel}] | ${pass ? 'PASS' : 'FAIL'}`);
  }

  // --- 3. RISK BOUNDARIES TESTS ---
  console.log('\n--- 3. RISK BOUNDARIES TESTS ---');
  const boundaryCases = [
    { name: 'Near 0 (Score: 0)', score: 0, expect: 'Low' },
    { name: 'Low Upper Bound (Score: 29)', score: 29, expect: 'Low' },
    { name: 'Moderate Lower Bound (Score: 30)', score: 30, expect: 'Moderate' },
    { name: 'Moderate Upper Bound (Score: 59)', score: 59, expect: 'Moderate' },
    { name: 'High Lower Bound (Score: 60)', score: 60, expect: 'High' },
    { name: 'High Upper Bound (Score: 85)', score: 85, expect: 'High' },
    { name: 'Critical Lower Bound (Score: 86)', score: 86, expect: 'Critical' },
    { name: 'Near 100 (Score: 100)', score: 100, expect: 'Critical' }
  ];

  for (const bc of boundaryCases) {
    const tier = getRiskTier(bc.score);
    const pass = tier.level === bc.expect;
    if (pass) stats.boundaryPassed++; else stats.boundaryFailed++;
    console.log(`[BOUND] ${bc.name.padEnd(35)} -> Tier Assigned: [${tier.level}] | ${pass ? 'PASS' : 'FAIL'}`);
  }

  // --- 4. JSON CONTRACT TESTS ---
  console.log('\n--- 4. JSON CONTRACT TESTS ---');
  const jsonTestSample = await extractSymptoms('Meri gaay ko bukhar hai aur pair mein chale hain.');
  const jsonPass = Array.isArray(jsonTestSample.symptoms) && jsonTestSample.symptoms.every(s => typeof s === 'string');
  if (jsonPass) stats.jsonPassed++; else stats.jsonFailed++;
  console.log(`[JSON-CONTRACT] Machine-readable array of normalized strings -> ${jsonPass ? 'PASS' : 'FAIL'}`);

  // --- 5. COORDINATE PRESERVATION TESTS ---
  console.log('\n--- 5. COORDINATE PRESERVATION TESTS ---');
  const coordCases = [
    { id: 'COORD-01', lat: 19.3002, lng: 73.0597, expLat: 19.3002, expLng: 73.0597 },
    { id: 'COORD-02', lat: 19.2183, lng: 72.9781, expLat: 19.2183, expLng: 72.9781 },
    { id: 'COORD-03', lat: 0, lng: 0, expLat: 0, expLng: 0 },
    { id: 'COORD-04', lat: null, lng: null, expLat: null, expLng: null },
    { id: 'COORD-05', lat: 'abc', lng: 'xyz', expLat: 'abc', expLng: 'xyz' }
  ];

  for (const cc of coordCases) {
    const res = await processCase({ farmerName: 'Demo Farmer', lat: cc.lat, lng: cc.lng, rawText: 'Gaay ko bukhar hai' });
    const pass = res.lat === cc.expLat && res.lng === cc.expLng;
    if (pass) stats.coordPassed++; else stats.coordFailed++;
    console.log(`[${cc.id}] Input (Lat=${cc.lat}, Lng=${cc.lng}) -> Result (Lat=${res.lat}, Lng=${res.lng}) | ${pass ? 'PASS' : 'FAIL'}`);
  }

  // --- 6. END-TO-END SIH DEMO SCENARIO ---
  console.log('\n--- 6. END-TO-END SIH DEMO SCENARIO ---');
  const demoCase = {
    farmerName: 'Ramesh Patil',
    village: 'Anjeer Phata, Bhiwandi',
    species: 'Bovine',
    lat: 19.3002,
    lng: 73.0597,
    rawText: 'Meri gaay ko bukhar hai aur pair mein chale hain. Woh khana bhi kam kha rahi hai.'
  };

  const normalRun = await processCase(demoCase);
  const fallbackRun = await processCase(demoCase, { mockMode: true });

  const integPass =
    normalRun.lat === 19.3002 &&
    normalRun.lng === 73.0597 &&
    normalRun.symptoms.includes('Fever') &&
    normalRun.symptoms.includes('Blisters') &&
    normalRun.symptoms.includes('Loss of Appetite') &&
    normalRun.riskScore === 100 &&
    fallbackRun.riskScore === 100 &&
    fallbackRun.lat === 19.3002;

  if (integPass) stats.integPassed++; else stats.integFailed++;
  console.log(`[DEMO-SCENARIO] Normal Run (Score: ${normalRun.riskScore}, Tier: ${normalRun.riskLevel}, Lat: ${normalRun.lat}, Lng: ${normalRun.lng}) | ${integPass ? 'PASS' : 'FAIL'}`);
  console.log(`[DEMO-SCENARIO] Fallback Run (Score: ${fallbackRun.riskScore}, Tier: ${fallbackRun.riskLevel}, Lat: ${fallbackRun.lat}, Lng: ${fallbackRun.lng}) | ${integPass ? 'PASS' : 'FAIL'}`);

  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY TABLE:');
  console.log(`AI edge cases   : ${stats.aiPassed} Passed | ${stats.aiFailed} Failed`);
  console.log(`Risk engine     : ${stats.riskPassed} Passed | ${stats.riskFailed} Failed`);
  console.log(`Risk boundaries : ${stats.boundaryPassed} Passed | ${stats.boundaryFailed} Failed`);
  console.log(`JSON handling   : ${stats.jsonPassed} Passed | ${stats.jsonFailed} Failed`);
  console.log(`Coordinates     : ${stats.coordPassed} Passed | ${stats.coordFailed} Failed`);
  console.log(`Integration     : ${stats.integPassed} Passed | ${stats.integFailed} Failed`);
  console.log('='.repeat(80));
}

runDay3Evaluation().catch(console.error);
