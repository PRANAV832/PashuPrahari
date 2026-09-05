/**
 * @file testRealGemini.js
 * @description Live API test script executing real requests to Google Gemini REST API.
 */

import { extractSymptoms } from '../src/ai/aiService.js';
import { processReport } from '../src/index.js';
import { SYMPTOM_EXTRACTION_SYSTEM_PROMPT, buildSymptomExtractionUserPrompt } from '../src/ai/symptomExtractionPrompt.js';

async function runLiveGeminiTests() {
  console.log('='.repeat(70));
  console.log('LIVE GOOGLE GEMINI API TEST EXECUTION');
  console.log('='.repeat(70));

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const apiKey = process.env.GEMINI_API_KEY;

  console.log(`Provider: ${process.env.AI_PROVIDER || 'gemini'}`);
  console.log(`Model: ${model}`);
  console.log(`API Key Configured: ${Boolean(apiKey)} (Length: ${apiKey ? apiKey.length : 0} chars)`);

  const tests = [
    {
      name: 'Test 1 — Hindi / Hinglish',
      input: 'Meri gaay ko bukhar hai aur pair mein chale hain.'
    },
    {
      name: 'Test 2 — Marathi',
      input: 'माझ्या गायीला ताप आहे आणि तिच्या पायावर फोड आले आहेत.'
    },
    {
      name: 'Test 3 — English',
      input: 'My cow has fever and is coughing.'
    },
    {
      name: 'Test 4 — No clear symptoms',
      input: 'My cow is eating normally and looks healthy.'
    }
  ];

  console.log('\n--- 1. Testing Raw Direct Gemini Endpoint Request ---');
  // Directly test raw endpoint to capture the unadulterated string response from Gemini
  const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const directPayload = {
    system_instruction: {
      parts: [{ text: SYMPTOM_EXTRACTION_SYSTEM_PROMPT }]
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: buildSymptomExtractionUserPrompt(tests[0].input) }]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      response_mime_type: 'application/json'
    }
  };

  try {
    const rawHttpRes = await fetch(directUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(directPayload)
    });

    console.log(`HTTP Status: ${rawHttpRes.status} ${rawHttpRes.statusText}`);
    const rawData = await rawHttpRes.json();
    const candidateText = rawData?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('Raw JSON string from Gemini:', candidateText);
  } catch (err) {
    console.error('Direct call error:', err.message);
  }

  console.log('\n--- 2. Testing Multilingual Test Cases via extractSymptoms() ---');
  for (const t of tests) {
    console.log('\n------------------------------------------------------------');
    console.log(`Input: "${t.input}" (${t.name})`);
    
    const extraction = await extractSymptoms(t.input);
    console.log(`Provider Used: ${extraction.provider}`);
    console.log(`Extraction Success: ${extraction.success}`);
    console.log(`Parsed Symptoms: ${JSON.stringify(extraction.symptoms)}`);
    if (extraction.error) console.log(`Error: ${extraction.error}`);
  }

  console.log('\n--- 3. Testing Complete Pipeline (Gemini -> Risk Engine) ---');
  const pipelineInput = 'Meri gaay ko bukhar hai aur pair mein chale hain.';
  const pipelineResult = await processReport(pipelineInput);
  console.log('Pipeline Input:', pipelineInput);
  console.log('Pipeline Output Result:');
  console.log(JSON.stringify(pipelineResult, null, 2));

  console.log('\n--- 4. Temporary Failure Handling Test ---');
  // Pass an invalid key temporarily to ensure application catches and handles it safely
  const failureTest = await extractSymptoms('Meri gaay ko bukhar hai', {
    apiKey: 'AIzaSy_INVALID_SIMULATED_KEY_12345',
    timeoutMs: 3000
  });
  console.log('Failure Test Result (with invalid key):');
  console.log(JSON.stringify(failureTest, null, 2));

  console.log('\n' + '='.repeat(70));
  console.log('GEMINI LIVE TEST RUN COMPLETE');
  console.log('='.repeat(70));
}

runLiveGeminiTests().catch(console.error);
