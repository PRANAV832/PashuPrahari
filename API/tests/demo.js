/**
 * @file demo.js
 * @description Interactive command-line demonstration of PashuPrahari AI Symptom Extraction & Rule Engine.
 * Run via: npm run demo  OR  node tests/demo.js
 */

import { processReport, extractSymptoms, calculateRisk } from '../src/index.js';

async function runDemo() {
  console.log('='.repeat(70));
  console.log('   PASHUPRAHARI (पशुप्रहरी) — AI & RISK ENGINE DAY 1 DEMO');
  console.log('='.repeat(70));
  console.log('');

  const sampleInputs = [
    {
      title: 'Sample 1: Hindi/Hinglish Farmer Voice Report (Suspected FMD)',
      text: 'Meri gaay ko bukhar hai aur pair mein chale hain, laar bhi tapak rahi hai.'
    },
    {
      title: 'Sample 2: Marathi Vernacular Report',
      text: 'Majhya gayila khup taap aala ahe aani payat phod ahet, chara pan nahi khat.'
    },
    {
      title: 'Sample 3: Mild Symptom Case (Low Risk)',
      text: 'Bail ko thodi halki khansi hai bas.'
    },
    {
      title: 'Sample 4: Moderate Symptom Case',
      text: 'Gaay ko kal se bukhar hai.'
    },
    {
      title: 'Sample 5: Critical Multisyndrome Case',
      text: 'Ghaai ko bukhar hai, saans lene me takleef ho rahi hai aur naak se khoon aa raha hai.'
    },
    {
      title: 'Sample 6: Irrelevant Conversational Audio (No Symptoms)',
      text: 'Namaste doctor sahab, humare yahan Bhiwandi gaao me aaj barish ho rahi hai.'
    }
  ];

  for (let i = 0; i < sampleInputs.length; i++) {
    const sample = sampleInputs[i];
    console.log(`[${i + 1}] ${sample.title}`);
    console.log(`Input Text: "${sample.text}"`);

    const result = await processReport(sample.text);

    console.log('----------------------------------------------------');
    console.log(`Extracted Symptoms : [ ${result.symptoms.map(s => `"${s}"`).join(', ')} ]`);
    console.log(`Calculated Risk    : ${result.riskScore}/100 [ ${result.riskLevel} ]`);
    console.log(`Recommended Action : ${result.recommendedAction}`);
    
    if (result.syndromesDetected && result.syndromesDetected.length > 0) {
      console.log(`Syndromic Flags    : ${result.syndromesDetected.map(s => s.name).join(' | ')}`);
    }

    console.log('Score Breakdown:');
    if (result.breakdown.length === 0) {
      console.log('  - No symptoms recorded (0 points)');
    } else {
      result.breakdown.forEach((item) => {
        console.log(`  • ${item.symptom.padEnd(22)}: +${item.weight} pts (${item.category}) — ${item.description}`);
      });
    }
    console.log('');
  }

  console.log('='.repeat(70));
  console.log('✅ Demo finished successfully. All modules operational.');
  console.log('='.repeat(70));
}

runDemo().catch((err) => {
  console.error('Demo execution error:', err);
});
