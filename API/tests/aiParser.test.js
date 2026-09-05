/**
 * @file aiParser.test.js
 * @description Unit tests for LLM response parser, JSON sanitization, and fallback recovery.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeJsonResponse,
  normalizeSymptomList,
  parseSymptomExtractionResponse,
  fallbackExtractKeywords
} from '../src/ai/aiParser.js';

test('AI Parser — Markdown Sanitization & JSON Parsing', async (t) => {

  await t.test('Clean raw JSON string parsing', () => {
    const raw = '{"symptoms": ["Fever", "Blisters"]}';
    const result = parseSymptomExtractionResponse(raw);

    assert.equal(result.success, true);
    assert.deepEqual(result.symptoms, ['Fever', 'Blisters']);
  });

  await t.test('Strips markdown ```json code fences', () => {
    const raw = '```json\n{\n  "symptoms": ["Fever", "Blisters", "Salivation"]\n}\n```';
    const result = parseSymptomExtractionResponse(raw);

    assert.equal(result.success, true);
    assert.deepEqual(result.symptoms, ['Fever', 'Blisters', 'Salivation']);
  });

  await t.test('Handles text with introductory commentary and markdown code blocks', () => {
    const raw = 'Here is the extracted JSON:\n```json\n{"symptoms": ["Lameness", "Loss of Appetite"]}\n```\nHope this helps!';
    const result = parseSymptomExtractionResponse(raw);

    assert.equal(result.success, true);
    assert.deepEqual(result.symptoms, ['Lameness', 'Loss of Appetite']);
  });

  await t.test('Normalizes symptom tokens and removes duplicates', () => {
    const list = ['fever', 'FEVER', '  Fever  ', 'blisters', 'Unknown Sign'];
    const normalized = normalizeSymptomList(list);

    assert.deepEqual(normalized, ['Fever', 'Blisters', 'Unknown Sign']);
  });

  await t.test('Gracefully handles empty or null input', () => {
    const emptyResult = parseSymptomExtractionResponse('');
    assert.equal(emptyResult.success, true);
    assert.deepEqual(emptyResult.symptoms, []);

    const nullResult = parseSymptomExtractionResponse(null);
    assert.equal(nullResult.success, true);
    assert.deepEqual(nullResult.symptoms, []);
  });

  await t.test('Fallback keyword extraction when LLM outputs plain text instead of JSON', () => {
    const nonJson = 'The cow appears to have high fever and severe blisters on the hooves.';
    const result = parseSymptomExtractionResponse(nonJson);

    // Should not crash and should extract detected clinical keywords
    assert.ok(result.symptoms.includes('Fever'));
    assert.ok(result.symptoms.includes('Blisters'));
  });
});
