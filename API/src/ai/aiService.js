/**
 * @file aiService.js
 * @description Modular AI service for extracting structured clinical symptoms from raw text.
 * Integrates with Google Gemini or OpenAI REST APIs without hardcoded credentials.
 */

import {
  SYMPTOM_EXTRACTION_SYSTEM_PROMPT,
  buildSymptomExtractionUserPrompt
} from './symptomExtractionPrompt.js';
import { parseSymptomExtractionResponse, fallbackExtractKeywords } from './aiParser.js';

// Automatically load .env file if present in Node.js environment
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile();
  }
} catch (e) {
  // Silent catch if .env does not exist
}

const DEFAULT_TIMEOUT_MS = 25000;

/**
 * Calls the Google Gemini REST API.
 * @param {string} rawText
 * @param {object} options
 * @returns {Promise<string>} Raw text response from model
 */
async function callGeminiApi(rawText, options = {}) {
  const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }

  const model = options.model || process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const timeoutMs = options.timeoutMs || Number(process.env.AI_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const payload = {
    system_instruction: {
      parts: [{ text: SYMPTOM_EXTRACTION_SYSTEM_PROMPT }]
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: buildSymptomExtractionUserPrompt(rawText, options.species) }]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      response_mime_type: 'application/json'
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const candidateText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return candidateText;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Gemini API call timed out after ${timeoutMs}ms`);
    }
    throw err;
  }
}

/**
 * Calls the OpenAI REST API.
 * @param {string} rawText
 * @param {object} options
 * @returns {Promise<string>} Raw text response from model
 */
async function callOpenAiApi(rawText, options = {}) {
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not configured');
  }

  const model = options.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const timeoutMs = options.timeoutMs || Number(process.env.AI_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

  const url = 'https://api.openai.com/v1/chat/completions';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const payload = {
    model,
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: SYMPTOM_EXTRACTION_SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: buildSymptomExtractionUserPrompt(rawText, options.species)
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const messageContent = data?.choices?.[0]?.message?.content || '';

    return messageContent;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`OpenAI API call timed out after ${timeoutMs}ms`);
    }
    throw err;
  }
}

/**
 * Fallback offline simulation for local testing when no API key is set or offline mode is active.
 * Extracts symptoms using vernacular keyword mappings so the system remains operable.
 * @param {string} rawText
 * @param {object} [options]
 * @returns {{ symptoms: Array<string>, aiAnalysis: object }}
 */
export function simulateVernacularExtraction(rawText, options = {}) {
  if (!rawText || typeof rawText !== 'string') {
    return {
      symptoms: [],
      aiAnalysis: { possibleConditions: [], explanation: '', recommendations: [] }
    };
  }

  const text = rawText.toLowerCase().trim();
  const species = options.species || 'Cattle';
  const specLower = species.toLowerCase();

  // Guard against general questions or hypotheticals WITHOUT active case statements
  const isInterrogative = (
    text.includes('kya problem') ||
    text.includes('ho sakti hai') ||
    text.includes('bulana chahiye') ||
    (text.includes('kya ') && (text.includes('chahiye') || text.includes('karna') || text.includes('bulana'))) ||
    text.startsWith('kya ') ||
    text.startsWith('kya?')
  );

  const hasActiveCaseIndicators = (
    text.includes('bukhar hai') ||
    text.includes('chale hain') ||
    text.includes('chale pad') ||
    text.includes('fever hai') ||
    text.includes('taap ahe') ||
    text.includes('sust ho gayi') ||
    text.includes('garm lag rahi hai') ||
    text.includes('khana nahi kha') ||
    text.includes('died') ||
    text.includes('dead') ||
    text.includes('mar gaye')
  );

  if (isInterrogative && !hasActiveCaseIndicators) {
    return {
      symptoms: [],
      aiAnalysis: { possibleConditions: [], explanation: '', recommendations: [] }
    };
  }

  // Handle non-specific / vague descriptions (e.g. "गाय ठीक नाही आहे", "my cow is not feeling good", "my cow is not well")
  const isVague =
    text === 'गाय ठीक नाही आहे' ||
    text === 'गाय ठीक नहीं है' ||
    text === 'cow is not well' ||
    text === 'my cow is not well.' ||
    text === 'my cow is not well' ||
    text === 'animal not feeling good' ||
    text === 'not well' ||
    (text.includes('ठीक नाही') && !text.includes('ताप') && !text.includes('फोड') && !text.includes('दूध') && !text.includes('चारा')) ||
    (text.includes('ठीक नहीं') && !text.includes('बुखार') && !text.includes('छाले') && !text.includes('दूध') && !text.includes('खाना'));

  if (isVague) {
    return {
      symptoms: [],
      aiAnalysis: {
        possibleConditions: ['Nonspecific Veterinary Indisposition - Requires Physical Examination'],
        explanation: `The description provided ("${rawText}") does not contain specific clinical signs. A full physical examination by a qualified veterinary officer is required to assess the ${species}.`,
        recommendations: [
          `Monitor the ${species} closely for specific signs like fever, appetite loss, or lesions.`,
          'Contact local veterinary officer for a physical checkup.'
        ]
      }
    };
  }

  // Handle explicit negation or healthy animals
  if (
    text.includes('does not have') ||
    text.includes('not have') ||
    text.includes('no fever') ||
    text.includes('no cough') ||
    text.includes('fever nahi') ||
    text.includes('cough bhi nahi') ||
    text.includes('bukhar nahi') ||
    text.includes('taap nahi')
  ) {
    return {
      symptoms: [],
      aiAnalysis: { possibleConditions: [], explanation: '', recommendations: [] }
    };
  }

  if (
    (text.includes('healthy') && !text.includes('unhealthy')) ||
    (text.includes('eating normally') && !text.includes('not eating')) ||
    text.includes('bilkul healthy') ||
    (text.includes('mera naam') && !text.includes('bukhar') && !text.includes('chale') && !text.includes('fever') && !text.includes('garam'))
  ) {
    return {
      symptoms: [],
      aiAnalysis: { possibleConditions: [], explanation: '', recommendations: [] }
    };
  }

  const symptoms = new Set();

  // Negative / Positive Safeguards
  const isMilkNormal =
    text.includes('giving milk normally') ||
    text.includes('milk normally') ||
    text.includes('normal milk') ||
    text.includes('doodh normal') ||
    text.includes('dudh normal');

  const isWalkingNormal =
    (text.includes('walks properly') ||
      text.includes('walk properly') ||
      text.includes('walking properly') ||
      text.includes('walks normally') ||
      text.includes('चालत आहे') ||
      text.includes('नीट चालत आहे')) &&
    !text.includes('not ') &&
    !text.includes('nahi') &&
    !text.includes('नाही') &&
    !text.includes('cannot') &&
    !text.includes('unable');

  // 1. Fever / High Fever
  if (
    text.includes('bukhar') ||
    text.includes('taap') ||
    text.includes('fever') ||
    text.includes('temperature') ||
    text.includes('garm') ||
    text.includes('garam') ||
    text.includes('बुखार') ||
    text.includes('ताप')
  ) {
    symptoms.add('Fever');
    if (
      text.includes('very high') ||
      text.includes('khup taap') ||
      text.includes('bahut tez') ||
      text.includes('तेज बुखार') ||
      text.includes('high fever')
    ) {
      symptoms.add('High fever');
    }
  }

  // 2. Foot Blisters / Oral Blisters / Blisters
  if (
    text.includes('chale') ||
    text.includes('phod') ||
    text.includes('phode') ||
    text.includes('blister') ||
    text.includes('vesicle') ||
    text.includes('chale aale') ||
    text.includes('छाले') ||
    text.includes('फोड') ||
    text.includes('फोडे')
  ) {
    if (
      text.includes('foot blister') ||
      text.includes('pair pe phode') ||
      text.includes('pair mein chale') ||
      text.includes('feet') ||
      text.includes('पायावर फोड')
    ) {
      symptoms.add('Foot blisters');
    }

    if (
      text.includes('mouth blister') ||
      text.includes('oral blister') ||
      text.includes('muh se chale') ||
      text.includes('muh mein chale') ||
      text.includes('mouth') ||
      text.includes('तोंडात फोड')
    ) {
      symptoms.add('Oral blisters');
    }

    symptoms.add('Blisters');
  }

  // 3. Excessive Salivation / Salivation
  if (
    text.includes('laar') ||
    text.includes('drool') ||
    text.includes('salivat') ||
    text.includes('laal') ||
    text.includes('jhaag') ||
    text.includes('froth') ||
    text.includes('झाग') ||
    text.includes('लाळ') ||
    text.includes('लार')
  ) {
    symptoms.add('Excessive salivation');
  }

  // 4. Reduced Milk Production / Drop in Milk Yield
  if (!isMilkNormal) {
    if (
      text.includes('doodh kam') ||
      text.includes('dudh kami') ||
      text.includes('dudh kami zala') ||
      text.includes('milk yield') ||
      text.includes('giving much milk') ||
      text.includes('producing much milk') ||
      text.includes('not giving milk') ||
      text.includes('no milk') ||
      text.includes('stopped giving milk') ||
      text.includes('drop in milk') ||
      text.includes('दूध कम') ||
      text.includes('दूध कमी') ||
      text.includes('दूधही कमी') ||
      text.includes('दूध देत नाही') ||
      text.includes('milk भी कम') ||
      text.includes('milk कमी') ||
      (text.includes('milk') &&
        (text.includes('kam') ||
          text.includes('kami') ||
          text.includes('कमी') ||
          text.includes('कम') ||
          text.includes('stopped') ||
          text.includes('drop'))) ||
      (text.includes('दूध') &&
        (text.includes('कमी') ||
          text.includes('नाही') ||
          text.includes('बंद') ||
          text.includes('कम')))
    ) {
      symptoms.add('Reduced milk production');
    }
  }

  // 5. Difficulty Standing / Inability to Stand
  if (
    text.includes('uthta') ||
    text.includes('get up') ||
    text.includes('unable to stand') ||
    text.includes('cannot stand') ||
    text.includes('उठता येत नाही') ||
    text.includes('नहीं उठ पा रही') ||
    text.includes('उठ नहीं')
  ) {
    symptoms.add('Difficulty standing / inability to stand');
  }

  // 6. Lameness / Difficulty Walking
  if (!isWalkingNormal) {
    if (
      text.includes('langda') ||
      text.includes('limp') ||
      text.includes('lameness') ||
      text.includes('properly walk') ||
      text.includes('walk nahi') ||
      text.includes('difficulty walking') ||
      text.includes('walking mein problem') ||
      text.includes('chalne mein dikkat') ||
      text.includes('chalne mein problem') ||
      text.includes('not able to walk') ||
      text.includes('unable to walk') ||
      text.includes('cannot walk') ||
      text.includes("can't walk") ||
      text.includes('नीट चालत नाही') ||
      text.includes('चल नहीं पा रही') ||
      text.includes('लंगड') ||
      text.includes('लंगडा') ||
      text.includes('लंगडत') ||
      text.includes('चालताना ती limp') ||
      text.includes('limping')
    ) {
      symptoms.add('Lameness');
    }
  }

  // 7. Loss of Appetite / Reduced Feed Intake
  if (
    text.includes('chara nahi') ||
    text.includes('chara kami') ||
    text.includes('chara pan kami') ||
    text.includes('khana nahi') ||
    text.includes('khana band') ||
    text.includes('khana kam') ||
    text.includes('khana bhi kam') ||
    text.includes('loss of appetite') ||
    text.includes('stopped eating') ||
    text.includes('not eating') ||
    text.includes('bhookh') ||
    text.includes('खाना नहीं') ||
    text.includes('नहीं खा') ||
    text.includes('खा नहीं') ||
    text.includes('चारा खात नाही') ||
    text.includes('चारा') ||
    text.includes('भूक') ||
    text.includes('जेवण बंद') ||
    text.includes('खात नाही') ||
    (text.includes('food') &&
      (text.includes('खात नाही') || text.includes('nahi kha') || text.includes('not eating')))
  ) {
    symptoms.add('Loss of Appetite');
  }

  // 8. Cough / Severe Cough
  if (
    text.includes('khansi') ||
    text.includes('khokla') ||
    text.includes('cough') ||
    text.includes('coughing') ||
    text.includes('खोकला') ||
    text.includes('खोकणे') ||
    text.includes('खांसी')
  ) {
    if (text.includes('severe') || text.includes('khup khokla') || text.includes('tez khansi')) {
      symptoms.add('Severe cough');
    } else if (text.includes('halki') || text.includes('mild') || text.includes('हल्की')) {
      symptoms.add('Mild Cough');
    } else {
      symptoms.add('Cough');
    }
  }

  // 9. Nasal Discharge
  if (
    text.includes('naak') ||
    text.includes('nasal') ||
    text.includes('shembad') ||
    text.includes('running nose') ||
    text.includes('नाक') ||
    text.includes('शेंबूड') ||
    (text.includes('nose') &&
      (text.includes('discharge') || text.includes('running') || text.includes('liquid')))
  ) {
    symptoms.add('Nasal Discharge');
  }

  // 10. Eye Discharge / Watery Eyes
  if (
    text.includes('aankh') ||
    text.includes('dolyatun') ||
    text.includes('eye discharge') ||
    text.includes('watery eye') ||
    text.includes('डोळ्यातून') ||
    text.includes('आंख से पानी')
  ) {
    symptoms.add('Eye Discharge');
  }

  // 11. Sunken eyes
  if (
    text.includes('sunk') ||
    text.includes('sunken') ||
    text.includes('sunken eyes') ||
    text.includes('eyes sunk') ||
    text.includes('eyes look slightly sunk') ||
    text.includes('धंसी हुई') ||
    text.includes('डोळे खोल')
  ) {
    symptoms.add('Sunken eyes');
  }

  // 12. Weakness
  if (
    text.includes('weak') ||
    text.includes('kamjor') ||
    text.includes('कमजोर') ||
    text.includes('ashakt') ||
    text.includes('अशक्त') ||
    text.includes('weakness') ||
    text.includes('kamjori')
  ) {
    symptoms.add('Weakness');
  }

  // 13. Lethargy
  if (
    text.includes('sust') ||
    text.includes('thakan') ||
    text.includes('letharg') ||
    text.includes('dull') ||
    text.includes('tired') ||
    text.includes('सुस्त') ||
    text.includes('थकवा')
  ) {
    symptoms.add('Lethargy');
  }

  // 14. Diarrhea / Severe watery diarrhea
  if (
    text.includes('dast') ||
    text.includes('loose motion') ||
    text.includes('diarrhea') ||
    text.includes('diarrhoea') ||
    text.includes('patla gobar') ||
    text.includes('झाडा') ||
    text.includes('पातळ शेण') ||
    text.includes('पतला दस्त') ||
    text.includes('दस्त') ||
    text.includes('जुलाब')
  ) {
    if (
      text.includes('severe watery') ||
      text.includes('watery diarrhoea') ||
      text.includes('watery diarrhea')
    ) {
      symptoms.add('Severe watery diarrhea');
    } else {
      symptoms.add('Diarrhea');
    }
  }

  // 15. Polydipsia / Excessive Water Intake / Increased Thirst
  if (
    text.includes('drinking a lot of water') ||
    text.includes('polydipsia') ||
    text.includes('excessive thirst') ||
    text.includes('increased thirst') ||
    text.includes('excessive water') ||
    text.includes('lots of water') ||
    text.includes('much water') ||
    text.includes('lot of water') ||
    text.includes('ज्यादा पानी') ||
    text.includes('जास्त पाणी') ||
    text.includes('खूप पाणी') ||
    text.includes('पानी पी रही') ||
    text.includes('pani pi rahi') ||
    text.includes('paani pee')
  ) {
    symptoms.add('Polydipsia');
  }

  // 16. Abdominal Swelling / Bloat / Distension
  if (
    text.includes('pet phool') ||
    text.includes('pet fool') ||
    (text.includes('पेट') &&
      (text.includes('फूल') || text.includes('फुग') || text.includes('सूज'))) ||
    text.includes('abdominal swelling') ||
    text.includes('abdominal distension') ||
    text.includes('bloat') ||
    text.includes('swollen belly')
  ) {
    symptoms.add('Abdominal Swelling');
  }

  // 17. Rapid Breathing / Respiratory Distress / Difficulty Breathing
  if (
    text.includes('saans') ||
    text.includes('सांस') ||
    text.includes('respiratory') ||
    text.includes('breath') ||
    text.includes('breathing') ||
    text.includes('haanf') ||
    text.includes('श्वास') ||
    text.includes('दम') ||
    text.includes('त्रास')
  ) {
    if (
      text.includes('tez') ||
      text.includes('fast') ||
      text.includes('rapid') ||
      text.includes('तेज') ||
      text.includes('सामान्य से तेज')
    ) {
      symptoms.add('Rapid breathing');
    } else if (
      text.includes('difficulty breathing') ||
      text.includes('सांस लेने में')
    ) {
      symptoms.add('Difficulty breathing');
    } else {
      symptoms.add('Respiratory Distress');
    }
  }

  // 18. Teeth Grinding
  if (
    text.includes('daant') ||
    text.includes('teeth grind') ||
    text.includes('grinding teeth') ||
    text.includes('दांत पीस') ||
    text.includes('दात खाणे') ||
    text.includes('दात कडकड')
  ) {
    symptoms.add('Teeth grinding');
  }

  // 19. Skin Lesions / Skin Nodules
  if (
    text.includes('gaanth') ||
    text.includes('lump') ||
    text.includes('nodule') ||
    text.includes('lesion') ||
    text.includes('fode') ||
    text.includes('गाठ') ||
    text.includes('गाठी')
  ) {
    symptoms.add('Skin Lesions');
  }

  // 20. Skin Discoloration / Purple Skin
  if (
    text.includes('purple skin') ||
    text.includes('red-purple') ||
    text.includes('skin patches') ||
    text.includes('cyanosis') ||
    text.includes('laal chakatte')
  ) {
    symptoms.add('Skin discoloration');
  }

  // 21. Sudden Mortality / Increased Mortality
  if (
    text.includes('died') ||
    text.includes('dead') ||
    text.includes('chickens died') ||
    text.includes('pigs died') ||
    text.includes('mortality') ||
    text.includes('mar gaye') ||
    text.includes('अचानक मृत्यु')
  ) {
    symptoms.add('Sudden Mortality');
  }

  const symptomsArr = Array.from(symptoms);
  let possibleConditions = [];
  let explanation = '';
  let recommendations = [];

  const symSet = new Set(symptomsArr);

  // Species-aware Differential Diagnosis Engine
  if (specLower.includes('poultry') || specLower.includes('chicken')) {
    if (symSet.has('Respiratory Distress') || symSet.has('Cough') || symSet.has('Sudden Mortality') || symSet.has('Nasal Discharge')) {
      possibleConditions = ['Possible Newcastle Disease (Ranikhet) / Avian Influenza'];
      explanation = `Acute respiratory signs accompanied by elevated mortality in poultry is a classic clinical presentation of Newcastle Disease or Avian Influenza.`;
      recommendations = [
        `Enforce strict biosecurity and isolate the affected flock immediately.`,
        'Notify local veterinary authorities for diagnostic sampling and quarantine measures.'
      ];
    } else {
      possibleConditions = symptomsArr.length > 0 ? ['Likely Avian Systemic / Respiratory Infection'] : ['Nonspecific Poultry Indisposition'];
      explanation = `Observed clinical signs: ${symptomsArr.join(', ')} in poultry flock.`;
      recommendations = ['Consult a poultry veterinarian for physical evaluation.'];
    }
  } else if (specLower.includes('pig') || specLower.includes('swine')) {
    if ((symSet.has('Fever') || symSet.has('High fever')) && (symSet.has('Skin discoloration') || symSet.has('Sudden Mortality') || symSet.has('Loss of Appetite'))) {
      possibleConditions = ['Suspected African Swine Fever (ASF) / Swine Erysipelas'];
      explanation = `High fever combined with purple skin discoloration and acute mortality in swine strongly suggests African Swine Fever (ASF) or Erysipelas.`;
      recommendations = [
        'Isolate sick pigs immediately and restrict herd movements.',
        'Urgent notification to animal health officer for laboratory confirmation.'
      ];
    } else {
      possibleConditions = symptomsArr.length > 0 ? ['Likely Swine Systemic Infection'] : ['Nonspecific Swine Indisposition'];
      explanation = `Observed clinical signs: ${symptomsArr.join(', ')} in swine.`;
      recommendations = ['Consult a swine veterinary specialist.'];
    }
  } else if (specLower.includes('goat') || specLower.includes('sheep')) {
    if (symSet.has('Loss of Appetite') && (symSet.has('Fever') || symSet.has('High fever')) && (symSet.has('Nasal Discharge') || symSet.has('Eye Discharge') || symSet.has('Diarrhea'))) {
      possibleConditions = ['Suspected Peste des Petits Ruminants (PPR)'];
      explanation = `High fever, ocular/nasal discharges, and anorexia in small ruminants like ${species} are characteristic signs of Peste des Petits Ruminants (PPR).`;
      recommendations = [
        `Isolate the sick ${species} in a warm dry shelter.`,
        'Seek immediate veterinary assistance for antibiotic cover and supportive therapy.'
      ];
    } else {
      possibleConditions = symptomsArr.length > 0 ? [`Likely ${species} Systemic Illness`] : ['Nonspecific Veterinary Indisposition - Requires Physical Examination'];
      explanation = symptomsArr.length > 0 ? `Extracted signs: ${symptomsArr.join(', ')} in ${species}.` : '';
      recommendations = ['Consult a veterinarian for physical checkup.'];
    }
  } else {
    // Cattle / Cow / Buffalo / General Ruminants
    if ((symSet.has('Fever') || symSet.has('High fever')) && (symSet.has('Foot blisters') || symSet.has('Oral blisters') || symSet.has('Blisters') || symSet.has('Excessive salivation'))) {
      possibleConditions = ['Possible Foot-and-Mouth Disease (FMD)'];
      explanation = `High fever accompanied by vesicular lesions on the feet/mouth and excessive salivation in ${species} strongly points towards Foot-and-Mouth Disease (FMD).`;
      recommendations = [
        `Isolate the affected ${species} immediately to halt contagious spread.`,
        'Notify local veterinary officer for official sampling and supportive care.',
        'Disinfect animal housing with sodium carbonate or antiviral agents.'
      ];
    } else if (symSet.has('Reduced milk production') && symSet.has('Difficulty standing / inability to stand')) {
      possibleConditions = ['Likely Milk Fever (Hypocalcemia) / Downer Cow Syndrome'];
      explanation = `Acute drop in milk yield combined with recumbency or inability to stand in ${species} is a classic presentation of metabolic hypocalcemia (Milk Fever) or Downer Cow Syndrome.`;
      recommendations = [
        `Do not force the ${species} to stand abruptly.`,
        'Contact a qualified veterinarian immediately for intravenous calcium therapy.',
        'Provide soft dry bedding.'
      ];
    } else if ((symSet.has('Fever') || symSet.has('High fever')) && (symSet.has('Skin Lesions') || symSet.has('Skin nodules'))) {
      possibleConditions = ['Possible Lumpy Skin Disease (LSD)'];
      explanation = `Fever combined with nodular skin eruptions in ${species} is characteristic of Lumpy Skin Disease (LSD).`;
      recommendations = [
        `Isolate the affected ${species} to prevent vector transmission.`,
        'Apply topical antiseptics to skin nodules and contact veterinary authorities.'
      ];
    } else if ((symSet.has('Fever') || symSet.has('High fever')) && (symSet.has('Cough') || symSet.has('Severe cough') || symSet.has('Respiratory Distress') || symSet.has('Nasal Discharge'))) {
      possibleConditions = ['Possible Bovine Respiratory Disease / Hemorrhagic Septicemia'];
      explanation = `High fever combined with cough, nasal discharge, and respiratory distress in ${species} indicates severe respiratory complex or Hemorrhagic Septicemia.`;
      recommendations = [
        `Keep the ${species} in a well-ventilated dry shed.`,
        'Call local veterinarian immediately for antibiotic and anti-inflammatory therapy.'
      ];
    } else if (symptomsArr.length > 0) {
      possibleConditions = ['Unclassified livestock health problem — veterinary evaluation recommended'];
      explanation = `Extracted clinical signs: ${symptomsArr.join(', ')} in ${species}. Veterinary examination recommended to establish a definitive diagnosis.`;
      recommendations = [
        `Isolate the affected ${species} if contagious signs appear.`,
        'Contact local veterinary officer for physical evaluation.'
      ];
    }
  }

  return {
    symptoms: symptomsArr,
    aiAnalysis: {
      possibleConditions,
      explanation,
      recommendations
    }
  };
}


/**
 * Main AI symptom extraction function.
 * Extracts structured symptoms from unstructured user text.
 * 
 * @param {string} rawText - Unstructured input string from farmer/paravet (voice transcription or text)
 * @param {object} [options] - Optional configurations (provider, apiKey, model, timeoutMs, species, mockMode)
 * @returns {Promise<{ success: boolean, symptoms: Array<string>, aiAnalysis: object, provider?: string, error?: string }>}
 */
export async function extractSymptoms(rawText, options = {}) {
  const text = (rawText || '').trim();

  // Edge case: Empty input
  if (!text) {
    return {
      success: true,
      symptoms: [],
      aiAnalysis: { possibleConditions: [], explanation: '', recommendations: [] },
      provider: 'none'
    };
  }

  // Check explicit Mock / Fallback Demo Mode (via options or environment variable AI_MOCK_MODE)
  const isMockMode = options.mockMode === true || process.env.AI_MOCK_MODE === 'true';
  if (isMockMode) {
    const mockExtraction = simulateVernacularExtraction(text, options);
    return {
      success: true,
      symptoms: mockExtraction.symptoms,
      aiAnalysis: mockExtraction.aiAnalysis,
      provider: 'mock-mode',
      notice: 'Explicit mock/fallback mode active for presentation demonstration.'
    };
  }

  // Determine provider: 'gemini' or 'openai'
  const provider = (
    options.provider ||
    process.env.AI_PROVIDER ||
    (process.env.GEMINI_API_KEY ? 'gemini' : process.env.OPENAI_API_KEY ? 'openai' : 'offline')
  ).toLowerCase();

  // If explicitly requested offline or no keys configured
  if (provider === 'offline' || (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY && !options.apiKey)) {
    const simulated = simulateVernacularExtraction(text, options);
    return {
      success: true,
      symptoms: simulated.symptoms,
      aiAnalysis: simulated.aiAnalysis,
      provider: 'offline-rule-matcher',
      warning: 'No AI API keys configured. Used offline vernacular pattern extraction.'
    };
  }

  try {
    let rawResponse = '';

    if (provider === 'openai') {
      rawResponse = await callOpenAiApi(text, options);
    } else {
      rawResponse = await callGeminiApi(text, options);
    }

    const parsed = parseSymptomExtractionResponse(rawResponse);

    return {
      success: parsed.success,
      symptoms: parsed.symptoms,
      aiAnalysis: parsed.aiAnalysis,
      provider,
      ...(parsed.error ? { parsingWarning: parsed.error } : {})
    };
  } catch (error) {
    console.warn(`[AI Service Warning] LLM call failed (${error.message}). Invoking fallback extraction.`);
    const fallback = simulateVernacularExtraction(text, options);

    return {
      success: false,
      symptoms: fallback.symptoms,
      aiAnalysis: fallback.aiAnalysis,
      provider: `${provider}-fallback`,
      error: error.message
    };
  }
}


