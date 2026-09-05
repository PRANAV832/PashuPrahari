/**
 * @file riskEngine.test.js
 * @description Unit tests for deterministic veterinary risk calculation engine.
 * Validates PRD-specified test cases and edge cases without requiring external network/APIs.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRisk, normalizeSymptomToken, getRiskTier } from '../src/rules/riskEngine.js';

test('Risk Engine — PRD Core Test Cases', async (t) => {

  await t.test('Case 1: Low Risk — ["Mild Cough"]', () => {
    const input = ['Mild Cough'];
    const result = calculateRisk(input);

    assert.equal(typeof result.riskScore, 'number');
    assert.ok(result.riskScore >= 0 && result.riskScore <= 29, `Score ${result.riskScore} should be in Low range [0, 29]`);
    assert.equal(result.riskLevel, 'Low');
    assert.equal(result.breakdown.length, 1);
    assert.equal(result.breakdown[0].symptom, 'Mild Cough');
    assert.equal(result.breakdown[0].weight, 15);
  });

  await t.test('Case 2: Moderate Risk — ["Fever"]', () => {
    const input = ['Fever'];
    const result = calculateRisk(input);

    assert.equal(typeof result.riskScore, 'number');
    assert.ok(result.riskScore >= 30 && result.riskScore <= 59, `Score ${result.riskScore} should be in Moderate range [30, 59]`);
    assert.equal(result.riskLevel, 'Moderate');
    assert.equal(result.breakdown.length, 1);
    assert.equal(result.breakdown[0].symptom, 'Fever');
    assert.equal(result.breakdown[0].weight, 35);
  });

  await t.test('Case 3: High Risk — ["Fever", "Blisters"]', () => {
    const input = ['Fever', 'Blisters'];
    const result = calculateRisk(input);

    assert.equal(typeof result.riskScore, 'number');
    assert.equal(result.riskScore, 85, 'Fever (35) + Blisters (50) should equal 85');
    assert.equal(result.riskLevel, 'High', 'Score of 85 should map to High risk tier per Architecture/PRD');
    assert.equal(result.breakdown.length, 2);
  });

  await t.test('Case 4: Empty input — []', () => {
    const input = [];
    const result = calculateRisk(input);

    assert.equal(result.riskScore, 0);
    assert.equal(result.riskLevel, 'Low');
    assert.deepEqual(result.breakdown, []);
    assert.deepEqual(result.syndromesDetected, []);
  });

  await t.test('Case 5: Duplicate symptoms — ["Fever", "Fever", "Blisters"]', () => {
    const input = ['Fever', 'Fever', 'Blisters'];
    const result = calculateRisk(input);

    // Score should NOT be inflated by duplicate Fever
    assert.equal(result.riskScore, 85);
    assert.equal(result.riskLevel, 'High');
    assert.equal(result.breakdown.length, 2, 'Breakdown should contain exactly 2 unique items');
  });

  await t.test('Case 6: Unknown symptom — ["SomeUnknownSymptom"]', () => {
    const input = ['SomeUnknownSymptom'];
    const result = calculateRisk(input);

    assert.equal(typeof result.riskScore, 'number');
    assert.ok(result.riskScore >= 0 && result.riskScore <= 100);
    assert.equal(result.riskLevel, 'Low');
    assert.equal(result.breakdown.length, 1);
    assert.equal(result.breakdown[0].symptom, 'SomeUnknownSymptom');
    assert.equal(result.breakdown[0].category, 'Unclassified');
  });
});

test('Risk Engine — Edge Cases & Boundary Clamping', async (t) => {

  await t.test('Null and undefined input resilience', () => {
    const nullResult = calculateRisk(null);
    assert.equal(nullResult.riskScore, 0);
    assert.equal(nullResult.riskLevel, 'Low');

    const undefResult = calculateRisk(undefined);
    assert.equal(undefResult.riskScore, 0);
    assert.equal(undefResult.riskLevel, 'Low');
  });

  await t.test('Clamping at 100 max boundary for multiple severe symptoms', () => {
    // Blisters (50) + Respiratory Distress (45) + Bleeding (45) + Fever (35) = 175 -> clamped to 100
    const severeInput = ['Blisters', 'Respiratory Distress', 'Bleeding', 'Fever'];
    const result = calculateRisk(severeInput);

    assert.equal(result.riskScore, 100);
    assert.equal(result.riskLevel, 'Critical');
  });

  await t.test('Case insensitivity & whitespace trimming in symptom names', () => {
    const input = ['  fever  ', 'BLISTERS'];
    const result = calculateRisk(input);

    assert.equal(result.riskScore, 85);
    assert.equal(result.riskLevel, 'High');
    assert.equal(result.breakdown[0].symptom, 'Fever');
    assert.equal(result.breakdown[1].symptom, 'Blisters');
  });

  await t.test('Alias normalization (e.g. bukhar -> Fever)', () => {
    const input = ['bukhar', 'chale'];
    const result = calculateRisk(input);

    assert.equal(result.riskScore, 85);
    assert.equal(result.riskLevel, 'High');
  });

  await t.test('Syndromic synergy detection (LSD Syndrome)', () => {
    const input = ['Fever', 'Skin Lesions'];
    const result = calculateRisk(input);

    // Fever (35) + Skin Lesions (40) + LSD Combo Bonus (10) = 85
    assert.equal(result.riskScore, 85);
    assert.equal(result.riskLevel, 'High');
    assert.equal(result.syndromesDetected.length, 1);
    assert.equal(result.syndromesDetected[0].name, 'Lumpy Skin Disease (LSD) Syndrome');
  });
});

test('Risk Engine — Livestock Deaths Risk Factor', async (t) => {

  await t.test('TEST 1: Same symptoms + 0 deaths = baseline symptom score', () => {
    const symptoms = ['Fever', 'Loss of Appetite']; // Fever (35) + Loss of Appetite (20) = 55
    const res0 = calculateRisk(symptoms, { deaths: 0 });
    assert.equal(res0.riskScore, 55);
    assert.equal(res0.riskLevel, 'Moderate');
  });

  await t.test('TEST 2: Same symptoms + 1 death > baseline score', () => {
    const symptoms = ['Fever', 'Loss of Appetite'];
    const res0 = calculateRisk(symptoms, { deaths: 0 });
    const res1 = calculateRisk(symptoms, { deaths: 1 });
    assert.ok(res1.riskScore > res0.riskScore, `Score with 1 death (${res1.riskScore}) should be > 0 deaths (${res0.riskScore})`);
    assert.equal(res1.riskScore, 70);
    assert.equal(res1.riskLevel, 'High');
  });

  await t.test('TEST 3: Same symptoms + 3 deaths > 1 death score', () => {
    const symptoms = ['Fever', 'Loss of Appetite'];
    const res1 = calculateRisk(symptoms, { deaths: 1 });
    const res3 = calculateRisk(symptoms, { deaths: 3 });
    assert.ok(res3.riskScore > res1.riskScore, `Score with 3 deaths (${res3.riskScore}) should be > 1 death (${res1.riskScore})`);
    assert.equal(res3.riskScore, 90);
    assert.equal(res3.riskLevel, 'Critical');
  });

  await t.test('TEST 4: Same symptoms + 5 deaths > 3 deaths score', () => {
    const symptoms = ['Fever', 'Loss of Appetite'];
    const res3 = calculateRisk(symptoms, { deaths: 3 });
    const res5 = calculateRisk(symptoms, { deaths: 5 });
    assert.ok(res5.riskScore > res3.riskScore, `Score with 5 deaths (${res5.riskScore}) should be > 3 deaths (${res3.riskScore})`);
    assert.equal(res5.riskScore, 100, 'Score should hit 100 cap');
    assert.equal(res5.riskLevel, 'Critical');
  });

  await t.test('TEST 5: Same symptoms + 10 deaths = Critical score capped at 100', () => {
    const symptoms = ['Fever', 'Loss of Appetite'];
    const res10 = calculateRisk(symptoms, { deaths: 10 });
    assert.equal(res10.riskScore, 100);
    assert.equal(res10.riskLevel, 'Critical');
  });

  await t.test('TEST 6: Monotonicity — more deaths never decrease score', () => {
    const symptoms = ['Loss of Appetite'];
    let prevScore = -1;
    for (let d = 0; d <= 15; d++) {
      const res = calculateRisk(symptoms, { deaths: d });
      assert.ok(res.riskScore >= prevScore, `Score at ${d} deaths (${res.riskScore}) should be >= score at ${d-1} deaths (${prevScore})`);
      prevScore = res.riskScore;
    }
  });

  await t.test('TEST 7 & 8: 0, missing, null, or undefined deaths add 0 extra risk', () => {
    const symptoms = ['Fever'];
    const base = calculateRisk(symptoms, 0);

    assert.equal(calculateRisk(symptoms, null).riskScore, base.riskScore);
    assert.equal(calculateRisk(symptoms, undefined).riskScore, base.riskScore);
    assert.equal(calculateRisk(symptoms, {}).riskScore, base.riskScore);
    assert.equal(calculateRisk(symptoms, { deaths: null }).riskScore, base.riskScore);
  });

  await t.test('TEST 9: Negative or invalid deaths normalized safely to 0', () => {
    const symptoms = ['Fever'];
    const base = calculateRisk(symptoms, 0);

    assert.equal(calculateRisk(symptoms, -5).riskScore, base.riskScore);
    assert.equal(calculateRisk(symptoms, { deaths: -10 }).riskScore, base.riskScore);
    assert.equal(calculateRisk(symptoms, { deaths: 'invalid' }).riskScore, base.riskScore);
  });

  await t.test('TEST 10: Final score clamped strictly to [0, 100]', () => {
    const symptoms = ['Blisters', 'Respiratory Distress', 'Bleeding', 'Fever'];
    const resHighDeaths = calculateRisk(symptoms, { deaths: 50 });
    assert.equal(resHighDeaths.riskScore, 100);
    assert.equal(resHighDeaths.riskLevel, 'Critical');
  });
});
