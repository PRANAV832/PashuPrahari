/**
 * @file aiService.test.js
 * @description Tests for AI service extraction, offline simulator, and end-to-end processReport pipeline.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { extractSymptoms, simulateVernacularExtraction } from '../src/ai/aiService.js';
import { processReport } from '../src/index.js';

test('AI Service — Vernacular Simulation & Extraction', async (t) => {

  await t.test('Offline simulator extracts Hindi symptoms', () => {
    const rawText = 'Meri gaay ko bukhar hai aur pair mein chale hain, chara nahi kha rahi.';
    const result = simulateVernacularExtraction(rawText);

    assert.ok(result.symptoms.includes('Fever'));
    assert.ok(result.symptoms.includes('Blisters'));
    assert.ok(result.symptoms.includes('Loss of Appetite'));
  });

  await t.test('Offline simulator extracts Marathi symptoms', () => {
    const rawText = 'Majhya gayila taap aala ahe aani payat phod ahet.';
    const result = simulateVernacularExtraction(rawText);

    assert.ok(result.symptoms.includes('Fever'));
    assert.ok(result.symptoms.includes('Blisters'));
  });

  await t.test('extractSymptoms handles empty string without failure', async () => {
    const result = await extractSymptoms('');
    assert.equal(result.success, true);
    assert.deepEqual(result.symptoms, []);
  });

  await t.test('End-to-End processReport pipeline produces complete Case-ready payload', async () => {
    const rawText = 'Meri gaay ko bukhar hai aur pair mein chale hain.';
    const result = await processReport(rawText);

    assert.equal(result.rawText, rawText);
    assert.ok(Array.isArray(result.symptoms));
    assert.ok(result.symptoms.includes('Fever'));
    assert.ok(result.symptoms.includes('Blisters'));
    assert.equal(result.riskScore, 85);
    assert.equal(result.riskLevel, 'High');
    assert.equal(result.status, 'Reported');
    assert.ok(Array.isArray(result.breakdown));
    assert.equal(result.breakdown.length, 2);
  });
});
