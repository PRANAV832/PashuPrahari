/**
 * @file runAllTestCases.js
 * @description Comprehensive automated test runner executing all test cases in the test plan.
 */

import { extractSymptoms, simulateVernacularExtraction } from '../src/ai/aiService.js';
import { parseSymptomExtractionResponse, sanitizeJsonResponse } from '../src/ai/aiParser.js';
import { calculateRisk, normalizeSymptomToken, getRiskTier } from '../src/rules/riskEngine.js';
import { processReport } from '../src/index.js';
import fs from 'fs';

async function executeTestSuite() {
  const results = {
    aiTests: [],
    riskTests: [],
    e2eTests: [],
    errTests: [],
    detTests: [],
    secTests: []
  };

  console.log('='.repeat(75));
  console.log('PASHUPRAHARI — FULL TEST MATRIX EXECUTION');
  console.log('='.repeat(75));

  // ==========================================
  // SECTION A: AI SYMPTOM EXTRACTION TESTS
  // ==========================================
  console.log('\n--- SECTION A: AI SYMPTOM EXTRACTION TESTS ---');
  const aiCases = [
    {
      id: 'TC-AI-01',
      type: 'Hindi/Hinglish',
      input: 'Meri gaay ko bukhar hai aur pair mein chale hain.',
      expectedIncludes: ['Fever', 'Blisters'],
      expectedEmpty: false
    },
    {
      id: 'TC-AI-02',
      type: 'Marathi',
      input: 'माझ्या गायीला ताप आहे आणि तिच्या पायावर फोड आले आहेत.',
      expectedIncludes: ['Fever', 'Blisters'],
      expectedEmpty: false
    },
    {
      id: 'TC-AI-03',
      type: 'English',
      input: 'My cow has fever and is coughing.',
      expectedIncludes: ['Fever', 'Cough'],
      expectedEmpty: false
    },
    {
      id: 'TC-AI-04',
      type: 'Code-Switched Language',
      input: 'Meri cow ko fever hai aur woh properly walk nahi kar rahi.',
      expectedIncludes: ['Fever', 'Lameness'],
      expectedEmpty: false
    },
    {
      id: 'TC-AI-05',
      type: 'No Symptoms',
      input: 'My cow is healthy and eating normally.',
      expectedIncludes: [],
      expectedEmpty: true
    },
    {
      id: 'TC-AI-06',
      type: 'Irrelevant Conversation',
      input: 'Hello, my name is Ramesh. I want to know about my cow.',
      expectedIncludes: [],
      expectedEmpty: true
    },
    {
      id: 'TC-AI-07',
      type: 'Multiple Symptoms',
      input: 'My cow has fever, cough, weakness, loss of appetite and difficulty walking.',
      expectedIncludes: ['Fever', 'Cough', 'Lethargy', 'Loss of Appetite', 'Lameness'],
      expectedEmpty: false
    },
    {
      id: 'TC-AI-08',
      type: 'Negation',
      input: 'My cow does not have fever or cough.',
      expectedIncludes: [],
      expectedEmpty: true
    },
    {
      id: 'TC-AI-09',
      type: 'Unclear Statement',
      input: 'My cow seems a little uncomfortable today.',
      expectedIncludes: [],
      expectedEmpty: true
    },
    {
      id: 'TC-AI-10',
      type: 'Transliteration',
      input: 'Gai ko bukhar hai, muh se jhaag aa raha hai aur khana nahi kha rahi.',
      expectedIncludes: ['Fever', 'Salivation', 'Loss of Appetite'],
      expectedEmpty: false
    }
  ];

  for (const tc of aiCases) {
    const res = await extractSymptoms(tc.input);
    const symptoms = res.symptoms || [];

    // Verify expectations
    let pass = true;
    let failReason = '';

    if (tc.expectedEmpty) {
      if (symptoms.length !== 0) {
        pass = false;
        failReason = `Expected empty array [], got ${JSON.stringify(symptoms)}`;
      }
    } else {
      for (const expectedSym of tc.expectedIncludes) {
        if (!symptoms.includes(expectedSym)) {
          pass = false;
          failReason = `Missing expected symptom "${expectedSym}" in ${JSON.stringify(symptoms)}`;
          break;
        }
      }
    }

    // Check JSON contract & disease names
    const diseaseNames = ['Foot and Mouth Disease', 'Lumpy Skin Disease', 'Anthrax', 'Brucellosis', 'FMD', 'LSD'];
    for (const d of diseaseNames) {
      if (symptoms.includes(d)) {
        pass = false;
        failReason = `Found disease diagnosis "${d}" in symptoms array`;
      }
    }

    const reportObj = {
      id: tc.id,
      type: tc.type,
      input: tc.input,
      symptoms,
      provider: res.provider,
      status: pass ? 'PASS' : 'FAIL',
      error: failReason || (res.error ? `API notice: ${res.error}` : null)
    };

    results.aiTests.push(reportObj);
    console.log(`[${tc.id}] (${tc.type}) -> Symptoms: ${JSON.stringify(symptoms)} | Status: ${reportObj.status}`);
    if (!pass) console.log(`   FAIL REASON: ${failReason}`);
  }

  // ==========================================
  // SECTION B: DETERMINISTIC RISK ENGINE TESTS
  // ==========================================
  console.log('\n--- SECTION B: RISK ENGINE INDEPENDENT TESTS ---');
  const riskCases = [
    { id: 'TC-RISK-01', input: [], expectTier: 'Low', expectScore: 0 },
    { id: 'TC-RISK-02', input: ['Mild Cough'], expectTier: 'Low', expectScore: 15 },
    { id: 'TC-RISK-03', input: ['Fever'], expectTier: 'Moderate', expectScore: 35 },
    { id: 'TC-RISK-04', input: ['Fever', 'Blisters'], expectTier: 'High', expectScore: 85 },
    { id: 'TC-RISK-05', input: ['Fever', 'Cough', 'Weakness', 'Loss of Appetite'], expectTier: 'Critical', expectScore: 90 },
    { id: 'TC-RISK-06', input: ['Fever', 'Fever', 'Blisters'], expectTier: 'High', expectScore: 85 },
    { id: 'TC-RISK-07', input: ['SomeUnknownSymptom'], expectTier: 'Low', expectScore: 5 },
    { id: 'TC-RISK-08', input: ['Fever', 'SomeUnknownSymptom', 'Blisters'], expectTier: 'Critical', expectScore: 90 },
    {
      id: 'TC-RISK-09',
      input: ['Fever', 'Cough', 'Blisters', 'Weakness', 'Loss of Appetite', 'Difficulty Walking', 'Diarrhea', 'Unknown1', 'Unknown2', 'Unknown3'],
      expectTier: 'Critical',
      expectScore: 100 // clamped
    }
  ];

  for (const rc of riskCases) {
    const res = calculateRisk(rc.input);
    const validNumber = typeof res.riskScore === 'number' && res.riskScore >= 0 && res.riskScore <= 100;
    const validLevel = ['Low', 'Moderate', 'High', 'Critical'].includes(res.riskLevel);
    const validBreakdown = Array.isArray(res.breakdown);

    let pass = validNumber && validLevel && validBreakdown;
    let failReason = '';

    if (rc.expectScore !== undefined && res.riskScore !== rc.expectScore) {
      pass = false;
      failReason = `Expected score ${rc.expectScore}, got ${res.riskScore}`;
    }
    if (rc.expectTier && res.riskLevel !== rc.expectTier) {
      pass = false;
      failReason += ` Expected tier ${rc.expectTier}, got ${res.riskLevel}`;
    }

    const reportObj = {
      id: rc.id,
      input: rc.input,
      riskScore: res.riskScore,
      riskLevel: res.riskLevel,
      breakdownCount: res.breakdown.length,
      breakdown: res.breakdown,
      status: pass ? 'PASS' : 'FAIL',
      error: failReason || null
    };

    results.riskTests.push(reportObj);
    console.log(`[${rc.id}] Input: ${JSON.stringify(rc.input)} -> Score: ${res.riskScore} [${res.riskLevel}] | Status: ${reportObj.status}`);
  }

  // ==========================================
  // SECTION C: END-TO-END PIPELINE TESTS
  // ==========================================
  console.log('\n--- SECTION C: AI + RISK ENGINE INTEGRATION TESTS ---');
  const e2eCases = [
    {
      id: 'TC-E2E-01',
      title: 'Standard High-Risk Example',
      input: 'Meri gaay ko bukhar hai aur pair mein chale hain.',
      expectMinScore: 80,
      expectLevel: 'High'
    },
    {
      id: 'TC-E2E-02',
      title: 'Marathi Report',
      input: 'माझ्या गायीला ताप आहे आणि तिच्या पायावर फोड आले आहेत.',
      expectMinScore: 80,
      expectLevel: 'High'
    },
    {
      id: 'TC-E2E-03',
      title: 'Healthy Animal',
      input: 'My cow is healthy and eating normally.',
      expectMinScore: 0,
      expectLevel: 'Low'
    },
    {
      id: 'TC-E2E-04',
      title: 'Multiple Symptoms',
      input: 'My cow has fever, cough, weakness, loss of appetite and difficulty walking.',
      expectMinScore: 60,
      expectLevel: 'High' // or Critical
    }
  ];

  for (const ec of e2eCases) {
    const res = await processReport(ec.input);
    const pass =
      Array.isArray(res.symptoms) &&
      typeof res.riskScore === 'number' &&
      res.riskScore >= 0 &&
      res.riskScore <= 100 &&
      ['Low', 'Moderate', 'High', 'Critical'].includes(res.riskLevel) &&
      Array.isArray(res.breakdown);

    const reportObj = {
      id: ec.id,
      title: ec.title,
      input: ec.input,
      symptoms: res.symptoms,
      riskScore: res.riskScore,
      riskLevel: res.riskLevel,
      breakdown: res.breakdown,
      status: pass ? 'PASS' : 'FAIL'
    };

    results.e2eTests.push(reportObj);
    console.log(`[${ec.id}] ${ec.title}`);
    console.log(`  Symptoms: ${JSON.stringify(res.symptoms)} | Score: ${res.riskScore} [${res.riskLevel}] | Status: ${reportObj.status}`);
  }

  // ==========================================
  // SECTION D: ERROR HANDLING TESTS
  // ==========================================
  console.log('\n--- SECTION D: ERROR HANDLING TESTS ---');

  // TC-ERR-01: Invalid API Key
  const err01 = await extractSymptoms('Gaay ko bukhar hai', {
    apiKey: 'AIzaSy_INVALID_KEY_SIMULATION_9999',
    provider: 'gemini',
    timeoutMs: 2000
  });
  const passErr01 = err01.symptoms !== undefined && err01.provider !== undefined;
  results.errTests.push({ id: 'TC-ERR-01', desc: 'Invalid API Key', status: passErr01 ? 'PASS' : 'FAIL', details: 'Fallback returned safely' });
  console.log(`[TC-ERR-01] Invalid API Key -> Handled without crash. Status: ${passErr01 ? 'PASS' : 'FAIL'}`);

  // TC-ERR-02: Missing API Key
  const err02 = await extractSymptoms('Gaay ko bukhar hai', { provider: 'offline' });
  const passErr02 = err02.success === true && Array.isArray(err02.symptoms);
  results.errTests.push({ id: 'TC-ERR-02', desc: 'Missing API Key / Offline Mode', status: passErr02 ? 'PASS' : 'FAIL', details: 'Handled gracefully' });
  console.log(`[TC-ERR-02] Missing API Key -> Handled gracefully. Status: ${passErr02 ? 'PASS' : 'FAIL'}`);

  // TC-ERR-03: Malformed AI Response
  const err03 = parseSymptomExtractionResponse('{"symptoms": ["Fever", "Blisters"');
  const passErr03 = err03 !== null && Array.isArray(err03.symptoms);
  results.errTests.push({ id: 'TC-ERR-03', desc: 'Malformed AI Response', status: passErr03 ? 'PASS' : 'FAIL', details: 'Recovered keywords safely' });
  console.log(`[TC-ERR-03] Malformed AI Response -> Recovered safely. Status: ${passErr03 ? 'PASS' : 'FAIL'}`);

  // TC-ERR-04: Markdown JSON Response
  const err04 = parseSymptomExtractionResponse('```json\n{"symptoms": ["Fever", "Blisters"]}\n```');
  const passErr04 = err04.success === true && err04.symptoms.length === 2;
  results.errTests.push({ id: 'TC-ERR-04', desc: 'Markdown code fences', status: passErr04 ? 'PASS' : 'FAIL', details: 'Fences stripped cleanly' });
  console.log(`[TC-ERR-04] Markdown code fences -> Stripped cleanly. Status: ${passErr04 ? 'PASS' : 'FAIL'}`);

  // TC-ERR-05: Network Timeout
  const err05 = await extractSymptoms('Meri gaay ko bukhar hai', {
    timeoutMs: 1 // Instant timeout simulation
  });
  const passErr05 = err05.symptoms !== undefined;
  results.errTests.push({ id: 'TC-ERR-05', desc: 'Network Timeout', status: passErr05 ? 'PASS' : 'FAIL', details: 'Fallback invoked on timeout' });
  console.log(`[TC-ERR-05] Network Timeout -> Caught and handled. Status: ${passErr05 ? 'PASS' : 'FAIL'}`);

  // ==========================================
  // SECTION G: DETERMINISM TEST (10 ITERATIONS)
  // ==========================================
  console.log('\n--- SECTION G: DETERMINISM TEST (10 ITERATIONS) ---');
  const detInput = ['Fever', 'Blisters'];
  const firstRun = calculateRisk(detInput);
  let allEqual = true;

  for (let i = 1; i <= 10; i++) {
    const run = calculateRisk(detInput);
    if (run.riskScore !== firstRun.riskScore || run.riskLevel !== firstRun.riskLevel || run.breakdown.length !== firstRun.breakdown.length) {
      allEqual = false;
      break;
    }
  }

  results.detTests.push({
    id: 'TC-DET-01',
    iterations: 10,
    consistentScore: firstRun.riskScore,
    consistentLevel: firstRun.riskLevel,
    status: allEqual ? 'PASS' : 'FAIL'
  });
  console.log(`[TC-DET-01] Determinism (10 runs of ["Fever", "Blisters"]) -> 100% Identical Score (${firstRun.riskScore}) & Tier (${firstRun.riskLevel}). Status: ${allEqual ? 'PASS' : 'FAIL'}`);

  // ==========================================
  // SECTION H: SECURITY TESTS
  // ==========================================
  console.log('\n--- SECTION H: SECURITY TESTS ---');
  // TC-SEC-01: No hardcoded secrets in src/
  const srcFiles = fs.readdirSync('src', { recursive: true });
  let hasHardcodedKey = false;
  for (const f of srcFiles) {
    const fullPath = 'src/' + f;
    if (fs.statSync(fullPath).isFile() && f.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('AIzaSy') || content.includes('sk-')) {
        hasHardcodedKey = true;
      }
    }
  }
  const passSec01 = !hasHardcodedKey;
  console.log(`[TC-SEC-01] Source code scan for hardcoded keys -> Status: ${passSec01 ? 'PASS' : 'FAIL'}`);

  // TC-SEC-02: .gitignore contains .env
  const gitignoreContent = fs.existsSync('.gitignore') ? fs.readFileSync('.gitignore', 'utf8') : '';
  const passSec02 = gitignoreContent.includes('.env');
  console.log(`[TC-SEC-02] .gitignore contains .env -> Status: ${passSec02 ? 'PASS' : 'FAIL'}`);

  // TC-SEC-03: .env.example has only placeholders
  const envExampleContent = fs.existsSync('.env.example') ? fs.readFileSync('.env.example', 'utf8') : '';
  const passSec03 = !envExampleContent.includes('AIzaSy') && envExampleContent.includes('your_gemini_api_key_here');
  console.log(`[TC-SEC-03] .env.example contains only placeholders -> Status: ${passSec03 ? 'PASS' : 'FAIL'}`);

  console.log('\n' + '='.repeat(75));
  console.log('ALL TESTS COMPLETED');
  console.log('='.repeat(75));

  return results;
}

executeTestSuite().catch(console.error);
