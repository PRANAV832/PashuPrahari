/**
 * @file runAiTests.js
 * @description Test runner executing the 13 mandatory multilingual, multi-species AI extraction & classification tests.
 */

import { extractSymptoms } from '../src/ai/aiService.js';
import { parseSymptomExtractionResponse } from '../src/ai/aiParser.js';

async function runAiTestSuite() {
  console.log('='.repeat(80));
  console.log('PASHUPRAHARI — EXPANDED AI MULTILINGUAL & VETERINARY TEST SUITE');
  console.log('='.repeat(80));

  let passedCount = 0;
  let failedCount = 0;

  const testCases = [
    {
      id: 'TEST-01',
      name: 'English FMD Pattern',
      species: 'Cattle',
      input: 'My cow has very high fever, blisters around the mouth and feet, and is drooling heavily.',
      validate: (res) => {
        const hasFever = res.symptoms.includes('Fever') || res.symptoms.includes('High fever');
        const hasFootBlisters = res.symptoms.includes('Foot blisters') || res.symptoms.includes('Blisters');
        const hasOralBlisters = res.symptoms.includes('Oral blisters') || res.symptoms.includes('Blisters') || res.symptoms.includes('Mouth lesions');
        const hasSalivation = res.symptoms.includes('Excessive salivation') || res.symptoms.includes('Salivation');
        const hasCondition = res.aiAnalysis.possibleConditions.some(c => c.includes('Foot-and-Mouth Disease') || c.includes('FMD'));
        return hasFever && (hasFootBlisters || hasOralBlisters) && hasSalivation && hasCondition;
      }
    },
    {
      id: 'TEST-02',
      name: 'Hindi FMD Pattern',
      species: 'Cattle',
      input: 'मेरी गाय को बहुत तेज बुखार है, मुंह और पैरों पर छाले हैं और मुंह से बहुत लार निकल रही है।',
      validate: (res) => {
        const hasFever = res.symptoms.includes('Fever') || res.symptoms.includes('High fever');
        const hasFootBlisters = res.symptoms.includes('Foot blisters') || res.symptoms.includes('Blisters');
        const hasSalivation = res.symptoms.includes('Excessive salivation');
        const hasCondition = res.aiAnalysis.possibleConditions.some(c => c.includes('Foot-and-Mouth Disease') || c.includes('FMD'));
        return hasFever && hasFootBlisters && hasSalivation && hasCondition;
      }
    },
    {
      id: 'TEST-03',
      name: 'Marathi FMD Pattern',
      species: 'Cattle',
      input: 'माझ्या गायीला खूप ताप आहे, तोंडातून खूप लाळ येत आहे आणि पायावर फोड आले आहेत।',
      validate: (res) => {
        const hasFever = res.symptoms.includes('Fever') || res.symptoms.includes('High fever');
        const hasSalivation = res.symptoms.includes('Excessive salivation');
        const hasFootBlisters = res.symptoms.includes('Foot blisters') || res.symptoms.includes('Blisters');
        const hasCondition = res.aiAnalysis.possibleConditions.some(c => c.includes('Foot-and-Mouth Disease') || c.includes('FMD'));
        return hasFever && hasSalivation && hasFootBlisters && hasCondition;
      }
    },
    {
      id: 'TEST-04',
      name: 'Hinglish FMD Pattern',
      species: 'Cattle',
      input: 'Meri cow ko bukhar hai, chara nahi kha rahi, muh se jhaag aa raha hai aur pair pe phode hain.',
      validate: (res) => {
        const hasFever = res.symptoms.includes('Fever') || res.symptoms.includes('High fever');
        const hasAppetite = res.symptoms.includes('Loss of Appetite');
        const hasSalivation = res.symptoms.includes('Excessive salivation');
        const hasFootBlisters = res.symptoms.includes('Foot blisters') || res.symptoms.includes('Blisters');
        const hasCondition = res.aiAnalysis.possibleConditions.some(c => c.includes('Foot-and-Mouth Disease') || c.includes('FMD'));
        return hasFever && hasAppetite && hasSalivation && hasFootBlisters && hasCondition;
      }
    },
    {
      id: 'TEST-05',
      name: 'Marathi Milk Fever Pattern',
      species: 'Cattle',
      input: 'माझी गाय नुकतीच वासरू झाली आहे, दूध कमी झाले आहे आणि तिला उठता येत नाही।',
      validate: (res) => {
        const hasMilk = res.symptoms.includes('Reduced milk production') || res.symptoms.includes('Drop in Milk Yield');
        const hasStand = res.symptoms.includes('Difficulty standing / inability to stand');
        const hasCondition = res.aiAnalysis.possibleConditions.some(c => c.includes('Milk Fever') || c.includes('Hypocalcemia') || c.includes('Downer Cow'));
        return hasMilk && hasStand && hasCondition;
      }
    },
    {
      id: 'TEST-06',
      name: 'English Respiratory Pattern',
      species: 'Cattle',
      input: 'My cow has fever, severe cough, difficulty breathing, nasal discharge and has stopped eating.',
      validate: (res) => {
        const hasFever = res.symptoms.includes('Fever') || res.symptoms.includes('High fever');
        const hasCough = res.symptoms.includes('Cough') || res.symptoms.includes('Severe cough');
        const hasResp = res.symptoms.includes('Respiratory Distress') || res.symptoms.includes('Difficulty breathing');
        const hasNasal = res.symptoms.includes('Nasal Discharge');
        const hasAppetite = res.symptoms.includes('Loss of Appetite');
        const notGeneric = !res.aiAnalysis.possibleConditions.some(c => c === 'Clinical Condition' || c === 'Animal Health Issue');
        return hasFever && hasCough && hasResp && hasNasal && hasAppetite && notGeneric;
      }
    },
    {
      id: 'TEST-07',
      name: 'Marathi Respiratory Pattern',
      species: 'Cattle',
      input: 'गायीला ताप आहे, खोकला येतोय, नाकातून पाणी येत आहे आणि श्वास घेण्यास त्रास होत आहे।',
      validate: (res) => {
        const hasFever = res.symptoms.includes('Fever');
        const hasCough = res.symptoms.includes('Cough') || res.symptoms.includes('Severe cough');
        const hasNasal = res.symptoms.includes('Nasal Discharge');
        const hasResp = res.symptoms.includes('Respiratory Distress');
        const notGeneric = !res.aiAnalysis.possibleConditions.some(c => c === 'Clinical Condition');
        return hasFever && hasCough && hasNasal && hasResp && notGeneric;
      }
    },
    {
      id: 'TEST-08',
      name: 'Goat PPR Pattern',
      species: 'Goat',
      input: 'माझ्या शेळीला खूप ताप आहे, ती चारा खात नाही, नाकातून पाणी येते आणि डोळ्यातून स्त्राव येतो।',
      validate: (res) => {
        const hasFever = res.symptoms.includes('Fever') || res.symptoms.includes('High fever');
        const hasAppetite = res.symptoms.includes('Loss of Appetite');
        const hasNasal = res.symptoms.includes('Nasal Discharge');
        const hasEye = res.symptoms.includes('Eye Discharge');
        const hasPPR = res.aiAnalysis.possibleConditions.some(c => c.includes('Peste des Petits Ruminants') || c.includes('PPR'));
        return hasFever && hasAppetite && hasNasal && hasEye && hasPPR;
      }
    },
    {
      id: 'TEST-09',
      name: 'Poultry Newcastle / Avian Influenza Pattern',
      species: 'Poultry / Chicken',
      input: 'Many chickens suddenly developed breathing problems, coughing, nasal discharge and several birds died.',
      validate: (res) => {
        const hasResp = res.symptoms.includes('Respiratory Distress') || res.symptoms.includes('Difficulty breathing');
        const hasCough = res.symptoms.includes('Cough');
        const hasNasal = res.symptoms.includes('Nasal Discharge');
        const hasMortality = res.symptoms.includes('Sudden Mortality') || res.symptoms.includes('Increased Mortality');
        const hasCondition = res.aiAnalysis.possibleConditions.some(c => c.includes('Newcastle') || c.includes('Avian Influenza') || c.includes('Ranikhet'));
        return hasResp && hasCough && hasNasal && hasMortality && hasCondition;
      }
    },
    {
      id: 'TEST-10',
      name: 'Pig Swine Fever / Erysipelas Pattern',
      species: 'Pig / Swine',
      input: 'My pigs have high fever, stopped eating, have red-purple skin patches and several pigs died suddenly.',
      validate: (res) => {
        const hasFever = res.symptoms.includes('High fever') || res.symptoms.includes('Fever');
        const hasAppetite = res.symptoms.includes('Loss of Appetite');
        const hasSkin = res.symptoms.includes('Skin discoloration') || res.symptoms.includes('Purple skin');
        const hasMortality = res.symptoms.includes('Sudden Mortality');
        const hasCondition = res.aiAnalysis.possibleConditions.some(c => c.includes('African Swine Fever') || c.includes('ASF') || c.includes('Erysipelas'));
        return hasFever && hasAppetite && hasSkin && hasMortality && hasCondition;
      }
    },
    {
      id: 'TEST-11',
      name: 'Vague Input Protection',
      species: 'Cattle',
      input: 'My cow is not well.',
      validate: (res) => {
        return res.symptoms.length === 0 && res.aiAnalysis.possibleConditions.some(c => c.includes('Nonspecific') || c.includes('Requires Physical Examination'));
      }
    },
    {
      id: 'TEST-12',
      name: 'Sentence Echo Protection',
      species: 'Cattle',
      input: 'my cow is not giving much milk and she is not able to get up',
      validate: (res) => {
        const hasMilk = res.symptoms.includes('Reduced milk production');
        const hasStand = res.symptoms.includes('Difficulty standing / inability to stand');
        const noSentenceEcho = !res.symptoms.some(s => s.includes('my cow is not giving much milk'));
        return hasMilk && hasStand && noSentenceEcho;
      }
    },
    {
      id: 'TEST-13',
      name: 'Mixed Marathi-English Pattern',
      species: 'Buffalo',
      input: 'Mazi buffalo la taap aahe, dudh kami zala aahe ani ti properly walk nahi karat.',
      validate: (res) => {
        const hasFever = res.symptoms.includes('Fever');
        const hasMilk = res.symptoms.includes('Reduced milk production') || res.symptoms.includes('Drop in Milk Yield');
        const hasLame = res.symptoms.includes('Lameness') || res.symptoms.includes('Difficulty walking');
        return hasFever && hasMilk && hasLame;
      }
    }
  ];

  for (const tc of testCases) {
    const res = await extractSymptoms(tc.input, { species: tc.species, mockMode: true });
    const isOk = tc.validate(res);

    if (isOk) {
      passedCount++;
      console.log(`[${tc.id}] ${tc.name.padEnd(45)} -> Symptoms: ${JSON.stringify(res.symptoms)} | Conditions: ${JSON.stringify(res.aiAnalysis.possibleConditions)} | PASS`);
    } else {
      failedCount++;
      console.log(`[${tc.id}] ${tc.name.padEnd(45)} -> Symptoms: ${JSON.stringify(res.symptoms)} | Conditions: ${JSON.stringify(res.aiAnalysis.possibleConditions)} | FAIL`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`TEST RESULTS: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log('='.repeat(80));

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAiTestSuite().catch((err) => {
  console.error('Fatal test suite error:', err);
  process.exit(1);
});
