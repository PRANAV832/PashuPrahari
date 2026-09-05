/**
 * @file runDay2Tests.js
 * @description Comprehensive test runner for Day 2 requirements.
 */

import { extractSymptoms } from '../src/ai/aiService.js';
import { calculateRisk, getRiskTier } from '../src/rules/riskEngine.js';
import { processCase, processReport } from '../src/index.js';
import { SYMPTOM_WEIGHTS, RISK_THRESHOLDS } from '../src/rules/riskRules.js';

async function runDay2Matrix() {
  console.log('='.repeat(75));
  console.log('PASHUPRAHARI — MEMBER 3 (DAY 2 / PHASE 2) TEST MATRIX');
  console.log('='.repeat(75));

  const stats = {
    aiPassed: 0,
    aiFailed: 0,
    riskPassed: 0,
    riskFailed: 0,
    coordPassed: 0,
    coordFailed: 0,
    integPassed: 0,
    integFailed: 0,
    errPassed: 0,
    errFailed: 0
  };

  // --- 1. AI VERNACULAR EXTRACTION TESTS ---
  console.log('\n--- 1. AI VERNACULAR EXTRACTION TESTS ---');
  const aiCases = [
    { id: 'AI-01', name: 'Hindi/Hinglish', input: 'Meri cow ko fever hai aur pair mein blisters hain.', expect: ['Fever', 'Blisters'], expectEmpty: false },
    { id: 'AI-02', name: 'Marathi', input: 'माझ्या गायीला ताप आहे आणि पायावर फोड आले आहेत.', expect: ['Fever', 'Blisters'], expectEmpty: false },
    { id: 'AI-03', name: 'Marathi-English', input: 'माझ्या cow ला fever आहे आणि ती properly walk करत नाही.', expect: ['Fever', 'Lameness'], expectEmpty: false },
    { id: 'AI-04', name: 'Transliteration', input: 'gai ko bukhar hai aur khana nahi kha rahi', expect: ['Fever', 'Loss of Appetite'], expectEmpty: false },
    { id: 'AI-05', name: 'Negation', input: 'meri gaay ko fever nahi hai', expect: [], expectEmpty: true },
    { id: 'AI-06', name: 'Question', input: 'kya fever hone par doctor ko bulana chahiye?', expect: [], expectEmpty: true },
    { id: 'AI-07', name: 'No Symptoms / Healthy', input: 'meri gaay bilkul healthy hai aur normally kha rahi hai', expect: [], expectEmpty: true },
    { id: 'AI-08', name: 'Multiple Symptoms', input: 'fever, cough, weakness, loss of appetite aur walking mein problem hai', expect: ['Fever', 'Cough', 'Lethargy', 'Loss of Appetite', 'Lameness'], expectEmpty: false },
    { id: 'AI-09', name: 'Duplicate Wording', input: 'fever hai, bahut fever hai, temperature bhi high hai', expect: ['Fever'], expectEmpty: false },
    { id: 'AI-10', name: 'Irrelevant Conversation', input: 'mera naam Ramesh hai aur main Bhiwandi mein rehta hoon', expect: [], expectEmpty: true }
  ];

  for (const ac of aiCases) {
    const res = await extractSymptoms(ac.input);
    const symptoms = res.symptoms || [];
    let pass = true;

    if (ac.expectEmpty) {
      pass = symptoms.length === 0;
    } else {
      pass = ac.expect.every(e => symptoms.some(s => s.toLowerCase().includes(e.toLowerCase()) || e.toLowerCase().includes(s.toLowerCase())));
    }

    if (pass) stats.aiPassed++; else stats.aiFailed++;
    console.log(`[${ac.id}] ${ac.name.padEnd(25)}: Input="${ac.input.slice(0, 40)}..." -> Symptoms: ${JSON.stringify(symptoms)} | ${pass ? 'PASS' : 'FAIL'}`);
  }

  // --- 2. RISK ENGINE TESTS ---
  console.log('\n--- 2. RISK ENGINE TESTS ---');
  const riskCases = [
    { id: 'RISK-01', input: [], expectScore: 0, expectTier: 'Low' },
    { id: 'RISK-02', input: ['Fever'], expectScore: 35, expectTier: 'Moderate' },
    { id: 'RISK-03', input: ['Blisters'], expectScore: 50, expectTier: 'Moderate' },
    { id: 'RISK-04', input: ['Fever', 'Blisters'], expectScore: 85, expectTier: 'High' },
    { id: 'RISK-05', input: ['Fever', 'Cough', 'Weakness'], expectScore: 70, expectTier: 'High' },
    { id: 'RISK-06', input: ['Fever', 'Fever', 'Blisters'], expectScore: 85, expectTier: 'High' },
    { id: 'RISK-07', input: ['UnknownSymptom'], expectScore: 5, expectTier: 'Low' },
    { id: 'RISK-08', input: ['Fever', 'UnknownSymptom', 'Blisters'], expectScore: 90, expectTier: 'Critical' },
    { id: 'RISK-09', input: ['Fever', 'Cough', 'Blisters', 'Weakness', 'Loss of Appetite', 'Difficulty Walking', 'Diarrhea', 'Bleeding', 'Respiratory Distress'], expectScore: 100, expectTier: 'Critical' }
  ];

  for (const rc of riskCases) {
    const res = calculateRisk(rc.input);
    const pass = res.riskScore === rc.expectScore && res.riskLevel === rc.expectTier && Array.isArray(res.breakdown);
    if (pass) stats.riskPassed++; else stats.riskFailed++;
    console.log(`[${rc.id}] Input: ${JSON.stringify(rc.input).padEnd(45)} -> Score: ${res.riskScore}/100 [${res.riskLevel}] | ${pass ? 'PASS' : 'FAIL'}`);
  }

  // --- 3. GEOSPATIAL COORDINATE TESTS ---
  console.log('\n--- 3. GEOSPATIAL COORDINATE TESTS ---');
  const coordCases = [
    { id: 'COORD-01', name: 'Valid Location 1', lat: 19.3002, lng: 73.0597, expectLat: 19.3002, expectLng: 73.0597 },
    { id: 'COORD-02', name: 'Valid Location 2', lat: 19.2183, lng: 72.9781, expectLat: 19.2183, expectLng: 72.9781 },
    { id: 'COORD-03', name: 'Missing Coordinates', lat: null, lng: null, expectLat: null, expectLng: null },
    { id: 'COORD-04', name: 'Invalid Coordinates', lat: 'abc', lng: 'xyz', expectLat: 'abc', expectLng: 'xyz' }
  ];

  for (const cc of coordCases) {
    const caseInput = { farmerName: 'Test Farmer', lat: cc.lat, lng: cc.lng, rawText: 'Gaay ko bukhar hai' };
    const res = await processCase(caseInput);
    const pass = res.lat === cc.expectLat && res.lng === cc.expectLng && res.farmerName === 'Test Farmer';
    if (pass) stats.coordPassed++; else stats.coordFailed++;
    console.log(`[${cc.id}] ${cc.name.padEnd(22)}: Lat=${res.lat}, Lng=${res.lng} (Exact Type: ${typeof res.lat}) | ${pass ? 'PASS' : 'FAIL'}`);
  }

  // --- 4. INTEGRATION & PIPELINE TESTS ---
  console.log('\n--- 4. END-TO-END INTEGRATION TEST ---');
  const fullCase = {
    farmerName: 'Suresh More',
    village: 'Padgha, Thane',
    lat: 19.3002,
    lng: 73.0597,
    species: 'Bovine',
    rawText: 'Meri cow ko fever hai aur pair mein chale hain. Woh khana bhi kam kha rahi hai.'
  };

  const processedCase = await processCase(fullCase);
  const integPass =
    processedCase.lat === 19.3002 &&
    processedCase.lng === 73.0597 &&
    processedCase.symptoms.includes('Fever') &&
    processedCase.symptoms.includes('Blisters') &&
    processedCase.symptoms.includes('Loss of Appetite') &&
    processedCase.riskScore >= 85 &&
    processedCase.breakdown.length === 3;

  if (integPass) stats.integPassed++; else stats.integFailed++;
  console.log(`[INTEG-01] End-to-End Case Processing: Status=${processedCase.status}, Symptoms=${JSON.stringify(processedCase.symptoms)}, Risk=${processedCase.riskScore} [${processedCase.riskLevel}] | ${integPass ? 'PASS' : 'FAIL'}`);

  // --- 5. ERROR HANDLING TESTS ---
  console.log('\n--- 5. ERROR HANDLING TESTS ---');
  const errTest1 = await extractSymptoms('Gaay ko bukhar hai', { apiKey: 'INVALID_TEST_KEY', timeoutMs: 1000 });
  const passErr1 = errTest1.symptoms !== undefined && Array.isArray(errTest1.symptoms);
  if (passErr1) stats.errPassed++; else stats.errFailed++;
  console.log(`[ERR-01] API Auth/Failure Handling: Handled without crashing (Fallback invoked) | ${passErr1 ? 'PASS' : 'FAIL'}`);

  const errTest2 = await extractSymptoms('Gaay ko bukhar hai', { timeoutMs: 1 });
  const passErr2 = errTest2.symptoms !== undefined;
  if (passErr2) stats.errPassed++; else stats.errFailed++;
  console.log(`[ERR-02] Timeout Handling: Handled cleanly | ${passErr2 ? 'PASS' : 'FAIL'}`);

  console.log('\n' + '='.repeat(75));
  console.log('SUMMARY STATS:');
  console.log(`AI extraction  : ${stats.aiPassed} Passed | ${stats.aiFailed} Failed`);
  console.log(`Risk engine    : ${stats.riskPassed} Passed | ${stats.riskFailed} Failed`);
  console.log(`Coordinates    : ${stats.coordPassed} Passed | ${stats.coordFailed} Failed`);
  console.log(`Integration    : ${stats.integPassed} Passed | ${stats.integFailed} Failed`);
  console.log(`Error handling : ${stats.errPassed} Passed | ${stats.errFailed} Failed`);
  console.log('='.repeat(75));
}

runDay2Matrix().catch(console.error);
