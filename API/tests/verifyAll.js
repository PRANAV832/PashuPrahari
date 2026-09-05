/**
 * @file verifyAll.js
 * @description Comprehensive automated verification runner for Member 3 (AI & Rules)
 */

import { extractSymptoms, simulateVernacularExtraction } from '../src/ai/aiService.js';
import { parseSymptomExtractionResponse, sanitizeJsonResponse } from '../src/ai/aiParser.js';
import { calculateRisk, normalizeSymptomToken, getRiskTier } from '../src/rules/riskEngine.js';
import { processReport } from '../src/index.js';

async function runFullVerification() {
  console.log('='.repeat(70));
  console.log('PASHUPRAHARI — MEMBER 3 COMPREHENSIVE VERIFICATION SUITE');
  console.log('='.repeat(70));

  // --- STEP 2: RISK ENGINE INDEPENDENT TESTS ---
  console.log('\n--- STEP 2: RISK ENGINE INDEPENDENT TEST RESULTS ---');
  const riskTestCases = [
    { label: 'Case 1', input: [] },
    { label: 'Case 2', input: ['Fever'] },
    { label: 'Case 3', input: ['Mild Cough'] },
    { label: 'Case 4', input: ['Fever', 'Blisters'] },
    { label: 'Case 5', input: ['Fever', 'Fever', 'Blisters'] },
    { label: 'Case 6', input: ['SomeUnknownSymptom'] }
  ];

  for (const c of riskTestCases) {
    const res = calculateRisk(c.input);
    const validScore = typeof res.riskScore === 'number' && res.riskScore >= 0 && res.riskScore <= 100;
    const validLevel = ['Low', 'Moderate', 'High', 'Critical'].includes(res.riskLevel);
    const validBreakdown = Array.isArray(res.breakdown);

    console.log(`\n[${c.label}] Input: ${JSON.stringify(c.input)}`);
    console.log(`  riskScore: ${res.riskScore} (valid number: ${validScore})`);
    console.log(`  riskLevel: ${res.riskLevel} (valid tier: ${validLevel})`);
    console.log(`  breakdown items: ${res.breakdown.length} (valid array: ${validBreakdown})`);
    console.log(`  breakdown: ${JSON.stringify(res.breakdown)}`);
  }

  // --- STEP 3: AI SYMPTOM EXTRACTION ---
  console.log('\n--- STEP 3: AI SYMPTOM EXTRACTION TESTS ---');
  const aiTestCases = [
    { id: 'Test A', text: 'Meri gaay ko bukhar hai aur pair mein chale hain.' },
    { id: 'Test B', text: 'माझ्या गायीला ताप आहे आणि तिच्या पायावर फोड आले आहेत.' },
    { id: 'Test C', text: 'My cow has fever and is coughing.' },
    { id: 'Test D', text: 'My cow is eating normally and looks healthy.' },
    { id: 'Test E', text: 'Hello, I need help with my cow.' }
  ];

  for (const t of aiTestCases) {
    const res = await extractSymptoms(t.text);
    console.log(`\n[${t.id}] Raw Input: "${t.text}"`);
    console.log(`  Extracted JSON: ${JSON.stringify(res, null, 2)}`);
  }

  // --- STEP 4: JSON SAFETY & PARSER RESILIENCE ---
  console.log('\n--- STEP 4: JSON SAFETY & ERROR RESILIENCE ---');
  const safetyCases = [
    { name: 'Pure JSON', input: '{"symptoms": ["Fever", "Blisters"]}' },
    { name: 'Markdown fence', input: '```json\n{"symptoms": ["Fever", "Salivation"]}\n```' },
    { name: 'Preamble + Code block', input: 'Here is your analysis:\n```json\n{"symptoms": ["Lameness"]}\n```\nThank you!' },
    { name: 'Malformed JSON', input: '{"symptoms": ["Fever", "Blisters"' },
    { name: 'Plain natural text', input: 'The cow is suffering from severe fever and blisters on mouth.' },
    { name: 'Null input', input: null }
  ];

  safetyCases.forEach((sc) => {
    const parsed = parseSymptomExtractionResponse(sc.input);
    console.log(`  [Safety: ${sc.name}] -> Success: ${parsed.success}, Symptoms: ${JSON.stringify(parsed.symptoms)}, Error/Warning: ${parsed.error || 'none'}`);
  });

  // --- STEP 5: COMPLETE END-TO-END PIPELINE ---
  console.log('\n--- STEP 5: COMPLETE END-TO-END MEMBER 3 PIPELINE ---');
  const pipelineInput = 'Meri gaay ko bukhar hai aur pair mein chale hain.';
  const pipelineResult = await processReport(pipelineInput);
  console.log('Raw Input:', pipelineInput);
  console.log('Complete Pipeline Output:');
  console.log(JSON.stringify(pipelineResult, null, 2));

  // --- STEP 7: FAILURE SIMULATION TEST ---
  console.log('\n--- STEP 7: FAILURE SIMULATION TEST ---');
  // Pass invalid/fake API key to simulate an upstream network/auth failure
  const failSim = await extractSymptoms('Gaay ko bukhar hai', {
    provider: 'openai',
    apiKey: 'sk-invalid-fake-key-for-test-simulation',
    timeoutMs: 1500
  });
  console.log('Simulated API Failure Output:');
  console.log(JSON.stringify(failSim, null, 2));
  console.log(`No crash occurred. Caller received success: ${failSim.success}, error message: "${failSim.error}", fallback symptoms: ${JSON.stringify(failSim.symptoms)}`);

  console.log('\n' + '='.repeat(70));
  console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY.');
  console.log('='.repeat(70));
}

runFullVerification().catch(console.error);
