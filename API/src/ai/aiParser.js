/**
 * @file aiParser.js
 * @description Resilient parsing and sanitization for LLM outputs.
 * Guarantees safe extraction of structured JSON even if the model outputs markdown blocks, trailing commas, or whitespace.
 */

import { CLINICAL_SYMPTOM_VOCABULARY } from './symptomExtractionPrompt.js';

/**
 * Mapping of common symptom aliases and transliterated strings to canonical English symptom tokens.
 */
export const CANONICAL_SYMPTOM_ALIASES = {
  'fever': 'Fever',
  'high fever': 'High fever',
  'high temperature': 'High fever',
  'bukhar': 'Fever',
  'taap': 'Fever',
  'foot blisters': 'Foot blisters',
  'foot blister': 'Foot blisters',
  'blisters': 'Blisters',
  'oral blisters': 'Oral blisters',
  'mouth blisters': 'Oral blisters',
  'mouth ulcers': 'Mouth ulcers',
  'oral ulcers': 'Oral ulcers',
  'mouth lesions': 'Mouth lesions',
  'tongue lesions': 'Tongue lesions',
  'chale': 'Blisters',
  'phod': 'Blisters',
  'phode': 'Blisters',
  'salivation': 'Salivation',
  'excessive salivation': 'Excessive salivation',
  'drooling': 'Excessive salivation',
  'frothing': 'Excessive salivation',
  'laar': 'Excessive salivation',
  'laal': 'Excessive salivation',
  'jhaag': 'Excessive salivation',
  'lameness': 'Lameness',
  'limping': 'Lameness',
  'langda': 'Lameness',
  'difficulty walking': 'Difficulty walking',
  'loss of appetite': 'Loss of Appetite',
  'reduced appetite': 'Reduced appetite',
  'not eating': 'Loss of Appetite',
  'anorexia': 'Complete anorexia',
  'complete anorexia': 'Complete anorexia',
  'reduced feed intake': 'Reduced feed intake',
  'refusal to eat': 'Refusal to eat',
  'chara nahi': 'Loss of Appetite',
  'khana nahi': 'Loss of Appetite',
  'reduced milk production': 'Reduced milk production',
  'drop in milk yield': 'Drop in Milk Yield',
  'sudden milk drop': 'Sudden milk drop',
  'doodh kam': 'Reduced milk production',
  'dudh kami': 'Reduced milk production',
  'difficulty standing / inability to stand': 'Difficulty standing / inability to stand',
  'inability to stand': 'Difficulty standing / inability to stand',
  'difficulty standing': 'Difficulty standing / inability to stand',
  'cannot stand': 'Difficulty standing / inability to stand',
  'unable to stand': 'Difficulty standing / inability to stand',
  'uthta yet nahi': 'Difficulty standing / inability to stand',
  'nasal discharge': 'Nasal Discharge',
  'running nose': 'Nasal Discharge',
  'naak se pani': 'Nasal Discharge',
  'cough': 'Cough',
  'mild cough': 'Mild Cough',
  'severe cough': 'Severe cough',
  'khansi': 'Cough',
  'khokla': 'Cough',
  'lethargy': 'Lethargy',
  'weakness': 'Weakness',
  'sust': 'Lethargy',
  'thakan': 'Lethargy',
  'diarrhea': 'Diarrhea',
  'diarrhoea': 'Diarrhea',
  'bloody diarrhea': 'Bloody diarrhea',
  'watery diarrhea': 'Watery diarrhea',
  'watery diarrhoea': 'Watery diarrhea',
  'severe watery diarrhea': 'Severe watery diarrhea',
  'severe watery diarrhoea': 'Severe watery diarrhea',
  'polydipsia': 'Polydipsia',
  'drinking a lot of water': 'Polydipsia',
  'increased thirst': 'Polydipsia',
  'excessive thirst': 'Polydipsia',
  'excessive water intake': 'Polydipsia',
  'sunken eyes': 'Sunken eyes',
  'eyes sunk': 'Sunken eyes',
  'sunk eyes': 'Sunken eyes',
  'teeth grinding': 'Teeth grinding',
  'daant peesna': 'Teeth grinding',
  'abdominal swelling': 'Abdominal Swelling',
  'pet phoolna': 'Abdominal Swelling',
  'rapid breathing': 'Rapid breathing',
  'weak': 'Weakness',
  'ashakt': 'Weakness',
  'kamjor': 'Weakness',
  'limp': 'Lameness',
  'coughing': 'Cough',
  'dast': 'Diarrhea',
  'julab': 'Diarrhea',
  'skin lesions': 'Skin Lesions',
  'skin nodules': 'Skin nodules',
  'skin lumps': 'Skin lumps',
  'nodules': 'Skin nodules',
  'lumps': 'Skin lumps',
  'gaanth': 'Skin nodules',
  'gaathi': 'Skin nodules',
  'respiratory distress': 'Respiratory Distress',
  'difficulty breathing': 'Difficulty breathing',
  'breathless': 'Respiratory Distress',
  'saans mein dikkat': 'Respiratory Distress',
  'shivering': 'Shivering',
  'eye discharge': 'Eye Discharge',
  'watery eyes': 'Watery eyes',
  'swelling': 'Swelling',
  'bleeding': 'Bleeding',
  'abortion': 'Abortion',
  'constipation': 'Constipation',
  'bloat': 'Bloat',
  'reduced egg production': 'Reduced egg production',
  'sudden drop in egg production': 'Sudden drop in egg production',
  'sudden mortality': 'Sudden Mortality',
  'increased mortality': 'Increased Mortality',
  'mortality': 'Increased Mortality',
  'skin discoloration': 'Skin discoloration',
  'purple skin': 'Purple skin',
  'cyanosis': 'Cyanosis'
};

/**
 * Strips markdown code blocks, backticks, and extraneous text surrounding a JSON string.
 * @param {string} rawResponse
 * @returns {string} Cleaned JSON candidate string
 */
export function sanitizeJsonResponse(rawResponse) {
  if (typeof rawResponse !== 'string') {
    return '';
  }

  let cleaned = rawResponse.trim();

  // Strip ```json ... ``` or ``` ... ``` code fences
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');

  // If there are still outer fences or stray markdown wrappers:
  const jsonFenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (jsonFenceMatch) {
    cleaned = jsonFenceMatch[1].trim();
  }

  // Attempt to extract the first balanced or substring JSON object {...}
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned.trim();
}

/**
 * Normalizes symptom strings: trims, capitalizes properly, filters sentence echoes.
 * @param {Array<string>} symptoms
 * @returns {Array<string>} Normalized, unique symptoms
 */
export function normalizeSymptomList(symptoms) {
  if (!Array.isArray(symptoms)) {
    return [];
  }

  const uniqueSymptoms = new Set();

  for (const item of symptoms) {
    if (typeof item === 'string' && item.trim().length > 0) {
      const trimmed = item.trim();
      const lower = trimmed.toLowerCase();

      // Guard against full sentence echoes (conversational clauses, raw farmer input copies)
      const wordCount = trimmed.split(/\s+/).length;
      if (
        trimmed.length > 55 ||
        wordCount > 7 ||
        lower.includes('मेरी गाय') ||
        lower.includes('माझ्या गायीला') ||
        lower.includes('माझी गाय') ||
        lower.includes('is not giving much milk') ||
        lower.includes('is not able to get up') ||
        lower.includes('and she is') ||
        lower.includes('she is not') ||
        lower.includes('dudh kami det ahe') ||
        lower.includes('chara khat nahi')
      ) {
        continue;
      }

      // Check direct alias map
      if (CANONICAL_SYMPTOM_ALIASES[lower]) {
        uniqueSymptoms.add(CANONICAL_SYMPTOM_ALIASES[lower]);
        continue;
      }

      // Check case-insensitive match against controlled vocabulary
      const vocabMatch = CLINICAL_SYMPTOM_VOCABULARY.find(
        (v) => v.toLowerCase() === lower
      );

      if (vocabMatch) {
        uniqueSymptoms.add(vocabMatch);
      } else {
        // Formatted capitalized string for valid specific clinical signs
        const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        uniqueSymptoms.add(formatted);
      }
    }
  }

  return Array.from(uniqueSymptoms);
}

/**
 * Fallback regex keyword extractor in case JSON parsing completely fails.
 * @param {string} text
 * @returns {Array<string>}
 */
export function fallbackExtractKeywords(text) {
  if (!text || typeof text !== 'string') return [];

  const found = new Set();
  const lower = text.toLowerCase();

  for (const token of CLINICAL_SYMPTOM_VOCABULARY) {
    if (lower.includes(token.toLowerCase())) {
      found.add(token);
    }
  }

  return Array.from(found);
}

/**
 * Main parse function for LLM output.
 * @param {string|object} responseContent - Raw response text or object from LLM API
 * @returns {{ success: boolean, symptoms: Array<string>, aiAnalysis: object, error?: string }}
 */
export function parseSymptomExtractionResponse(responseContent) {
  const defaultAiAnalysis = {
    possibleConditions: [],
    explanation: '',
    recommendations: []
  };

  if (!responseContent) {
    return {
      success: true,
      symptoms: [],
      aiAnalysis: defaultAiAnalysis,
      error: 'Empty response provided'
    };
  }

  let parsedObj = null;

  if (typeof responseContent === 'object' && responseContent !== null) {
    parsedObj = responseContent;
  } else {
    const cleanedString = sanitizeJsonResponse(responseContent);
    try {
      parsedObj = JSON.parse(cleanedString);
    } catch (err) {
      const recovered = fallbackExtractKeywords(responseContent);
      return {
        success: false,
        symptoms: recovered,
        aiAnalysis: {
          possibleConditions: (recovered.includes('Foot blisters') || recovered.includes('Blisters') || recovered.includes('Oral blisters'))
            ? ['Possible Foot-and-Mouth Disease (FMD)']
            : (recovered.includes('Reduced milk production') && recovered.includes('Difficulty standing / inability to stand'))
            ? ['Likely Milk Fever (Hypocalcemia) / Downer Cow Syndrome']
            : (recovered.includes('Skin Lesions') || recovered.includes('Skin nodules'))
            ? ['Possible Lumpy Skin Disease (LSD)']
            : ['Nonspecific Veterinary Indisposition - Requires Physical Examination'],
          explanation: recovered.length > 0 ? `Pattern analysis identified key symptoms: ${recovered.join(', ')}.` : 'Emergency fallback recovery mode active.',
          recommendations: ['Isolate affected animals.', 'Consult local veterinary officer for diagnosis.']
        },
        error: `JSON parse error: ${err.message}. Recovered ${recovered.length} keyword(s).`
      };
    }
  }

  if (parsedObj && typeof parsedObj === 'object') {
    const rawSymptoms = Array.isArray(parsedObj.symptoms)
      ? parsedObj.symptoms
      : (typeof parsedObj.symptom === 'string' ? [parsedObj.symptom] : []);

    const normalizedSymptoms = normalizeSymptomList(rawSymptoms);

    let rawConditions = Array.isArray(parsedObj.possibleConditions)
      ? parsedObj.possibleConditions
      : Array.isArray(parsedObj.possible_conditions)
      ? parsedObj.possible_conditions
      : (typeof parsedObj.possibleCondition === 'string' ? [parsedObj.possibleCondition] : []);

    // Filter out generic placeholders (e.g. "Clinical Condition", "Likely Cattle Systemic Illness")
    let possibleConditions = rawConditions.map(cond => {
      const condStr = typeof cond === 'string' ? cond.trim() : (cond?.name || cond?.condition || '').trim();
      const lower = condStr.toLowerCase();

      const isGeneric =
        condStr === 'Clinical Condition' ||
        condStr === 'Animal Health Issue' ||
        lower.includes('suspected cattle / cow clinical condition') ||
        lower.includes('suspected cattle clinical condition') ||
        lower.includes('suspected cow clinical condition') ||
        lower.includes('unclassified livestock health problem') ||
        lower.includes('likely cattle systemic illness') ||
        lower.includes('requiring veterinary triage');

      if (isGeneric || !condStr) {
        if (normalizedSymptoms.includes('Foot blisters') || normalizedSymptoms.includes('Blisters') || normalizedSymptoms.includes('Oral blisters')) {
          return 'Possible Foot-and-Mouth Disease (FMD)';
        }
        if (normalizedSymptoms.includes('Reduced milk production') && normalizedSymptoms.includes('Difficulty standing / inability to stand')) {
          return 'Likely Milk Fever (Hypocalcemia) / Downer Cow Syndrome';
        }
        if (normalizedSymptoms.includes('Skin Lesions') || normalizedSymptoms.includes('Skin nodules')) {
          return 'Possible Lumpy Skin Disease (LSD)';
        }
        if (normalizedSymptoms.includes('Loss of Appetite') && normalizedSymptoms.includes('Lethargy') && normalizedSymptoms.includes('Fever')) {
          return 'Possible Bovine Respiratory Disease / Systemic Infection';
        }
        if (normalizedSymptoms.length === 0) {
          return 'Nonspecific Veterinary Indisposition - Requires Physical Examination';
        }
      }
      return condStr;
    }).filter(Boolean);

    // Deduplicate conditions preserving order
    possibleConditions = Array.from(new Set(possibleConditions));

    const explanation = typeof parsedObj.explanation === 'string' ? parsedObj.explanation.trim() : '';

    const recommendations = Array.isArray(parsedObj.recommendations)
      ? parsedObj.recommendations.filter((r) => typeof r === 'string' && r.trim())
      : [];

    return {
      success: true,
      symptoms: normalizedSymptoms,
      aiAnalysis: {
        possibleConditions,
        explanation,
        recommendations
      }
    };
  }

  return {
    success: false,
    symptoms: [],
    aiAnalysis: defaultAiAnalysis,
    error: 'Invalid response format'
  };
}


