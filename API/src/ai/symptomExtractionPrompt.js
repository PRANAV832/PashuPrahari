/**
 * @file symptomExtractionPrompt.js
 * @description Dedicated system prompt and expanded controlled clinical vocabulary for veterinary symptom extraction.
 * Supports vernacular multilingual inputs (Hindi, Marathi, English, Hinglish, Marathiglish).
 */

/**
 * Standardized controlled clinical symptom vocabulary (Categories A through P).
 * All extracted symptoms must map to concise, normalized English tokens.
 */
export const CLINICAL_SYMPTOM_VOCABULARY = [
  // A. GENERAL / SYSTEMIC SIGNS
  'Fever',
  'High fever',
  'Low body temperature',
  'Lethargy',
  'Weakness',
  'Depression',
  'Restlessness',
  'Shivering',
  'Tremors',
  'Collapse',
  'Recumbency',
  'Difficulty standing / inability to stand',
  'Difficulty walking',
  'Lameness',
  'Stiffness',
  'Poor body condition',
  'Weight loss',
  'Sudden weight loss',
  'Dehydration',
  'Pale mucous membranes',
  'Yellow mucous membranes',
  'Bluish mucous membranes',
  'Swollen lymph nodes',
  'Increased body temperature',
  'Reduced activity',
  'Abnormal behavior',
  'Aggression',

  // B. APPETITE / FEEDING / DRINKING
  'Loss of Appetite',
  'Reduced appetite',
  'Complete anorexia',
  'Reduced feed intake',
  'Refusal to eat',
  'Difficulty eating',
  'Difficulty chewing',
  'Difficulty swallowing',
  'Polydipsia',
  'Increased Thirst',
  'Excessive thirst',
  'Reduced water intake',
  'Excessive water intake',
  'Dropping feed from mouth',
  'Reduced rumination',
  'Absent rumination',
  'Pica',

  // C. ORAL / MOUTH
  'Oral ulcers',
  'Mouth ulcers',
  'Mouth lesions',
  'Oral blisters',
  'Tongue lesions',
  'Tongue swelling',
  'Excessive salivation',
  'Salivation',
  'Drooling',
  'Frothing',
  'Bloody saliva',
  'Bad breath',
  'Jaw swelling',

  // D. SKIN / COAT
  'Skin Lesions',
  'Skin nodules',
  'Skin lumps',
  'Skin swelling',
  'Skin ulcers',
  'Skin wounds',
  'Skin crusts',
  'Skin scabs',
  'Skin redness',
  'Skin discoloration',
  'Hair loss',
  'Patchy hair loss',
  'Itching',
  'Excessive scratching',
  'Dermatitis',
  'Photosensitivity',
  'Swelling under skin',
  'Abscesses',
  'Pustules',
  'Vesicles',
  'Blisters',
  'Foot blisters',
  'Cracked skin',
  'Necrotic skin',
  'Skin bleeding',
  'Fly strike',
  'External parasites',
  'Ticks',
  'Lice',
  'Mites',

  // E. RESPIRATORY
  'Cough',
  'Mild Cough',
  'Severe cough',
  'Sneezing',
  'Nasal Discharge',
  'Clear nasal discharge',
  'Thick nasal discharge',
  'Bloody nasal discharge',
  'Difficulty breathing',
  'Respiratory Distress',
  'Rapid breathing',
  'Labored breathing',
  'Open-mouth breathing',
  'Wheezing',
  'Abnormal breathing sounds',
  'Gasping',
  'Nasal obstruction',
  'Exercise intolerance',

  // F. EYE
  'Eye Discharge',
  'Watery eyes',
  'Sunken eyes',
  'Excessive tearing',
  'Red eyes',
  'Eye swelling',
  'Cloudy eye',
  'Corneal opacity',
  'Corneal ulcer',
  'Blindness',
  'Partial blindness',
  'Squinting',
  'Light sensitivity',
  'Eye lesions',

  // G. EAR / NEUROLOGICAL
  'Head tilt',
  'Circling',
  'Seizures',
  'Convulsions',
  'Muscle spasms',
  'Incoordination',
  'Ataxia',
  'Paralysis',
  'Teeth grinding',
  'Weakness of limbs',
  'Hind-limb weakness',
  'Staggering',
  'Loss of balance',
  'Abnormal gait',
  'Unusual vocalization',
  'Loss of consciousness',

  // H. DIGESTIVE / GASTROINTESTINAL
  'Diarrhea',
  'Severe watery diarrhea',
  'Bloody diarrhea',
  'Watery diarrhea',
  'Constipation',
  'Abdominal pain',
  'Abdominal distension',
  'Abdominal Swelling',
  'Bloat',
  'Excessive gas',
  'Vomiting',
  'Regurgitation',
  'Blood in feces',
  'Mucus in feces',
  'Straining to defecate',
  'Reduced fecal output',
  'Increased fecal output',
  'Ruminal stasis',
  'Abnormal rumen movement',
  'Colic',
  'Rectal prolapse',

  // I. URINARY
  'Frequent urination',
  'Reduced urination',
  'Difficulty urinating',
  'Painful urination',
  'Blood in urine',
  'Dark urine',
  'Abnormal urine color',
  'Urinary obstruction',
  'Urinary incontinence',
  'Swollen urinary region',

  // J. REPRODUCTIVE / FEMALE
  'Infertility',
  'Reduced fertility',
  'Failure to conceive',
  'Abortion',
  'Repeated abortion',
  'Stillbirth',
  'Difficult birth',
  'Prolonged labor',
  'Retained placenta',
  'Uterine prolapse',
  'Vaginal discharge',
  'Bloody vaginal discharge',
  'Abnormal vaginal discharge',
  'Swollen vulva',
  'Reproductive tract infection',

  // K. MALE REPRODUCTIVE
  'Testicular swelling',
  'Testicular pain',
  'Testicular asymmetry',
  'Penile swelling',
  'Penile injury',
  'Reduced libido',
  'Breeding difficulty',

  // L. UDDER / MAMMARY
  'Reduced milk production',
  'Drop in Milk Yield',
  'Sudden milk drop',
  'Abnormal milk',
  'Blood in milk',
  'Clots in milk',
  'Watery milk',
  'Discolored milk',
  'Mastitis',
  'Swollen udder',
  'Painful udder',
  'Hot udder',
  'Hard udder',
  'Udder lesions',
  'Teat lesions',
  'Teat swelling',

  // M. MUSCULOSKELETAL
  'Joint swelling',
  'Joint pain',
  'Stiff joints',
  'Muscle weakness',
  'Muscle wasting',
  'Muscle tremors',
  'Muscle stiffness',
  'Fracture',
  'Limb injury',
  'Hoof injury',
  'Hoof deformity',
  'Hoof lesions',
  'Foot pain',

  // N. BLEEDING / CIRCULATORY
  'Bleeding',
  'Nosebleed',
  'Weak pulse',
  'Swelling',

  // O. POULTRY-SPECIFIC SIGNS
  'Reduced egg production',
  'Sudden drop in egg production',
  'Thin-shelled eggs',
  'Soft-shelled eggs',
  'Misshapen eggs',
  'Egg abnormalities',
  'Feather loss',
  'Ruffled feathers',
  'Drooping wings',
  'Pale comb',
  'Blue comb',
  'Swollen comb',
  'Facial swelling',
  'Sinus swelling',
  'Bloody droppings',
  'Green droppings',
  'Watery droppings',
  'Sudden Mortality',
  'Increased Mortality',
  'Twisted neck',
  'Cannibalism',
  'Vent inflammation',
  'Vent prolapse',

  // P. PIG / SWINE-SPECIFIC SIGNS
  'Skin discoloration',
  'Cyanosis',
  'Purple skin',
  'Skin hemorrhage',
  'Mummified fetuses',
  'Ear cyanosis',
  'Tail lesions'
];

/**
 * Strict System Prompt for LLM Symptom Extraction & Veterinary Classification.
 */
export const SYMPTOM_EXTRACTION_SYSTEM_PROMPT = `You are an expert veterinary epidemiologist and clinical diagnostic intelligence assistant for PashuPrahari (पशुप्रहरी).
Your core duty is to process unstructured natural-language incident reports from rural farmers and field paravets, extract individual concise standardized English clinical symptom tokens, and determine the closest plausible veterinary diseases/conditions in a strict JSON response.

### 1. MULTILINGUAL VERNACULAR & CODE-SWITCHING UNDERSTANDING:
- Analyze input text written in English, Hindi (Devanagari or Hinglish), Marathi (Devanagari or Marathiglish), or any mixed code-switched combination.
- Translate rural vernacular descriptions into standardized, concise English clinical symptom labels:
  - "बुखार" / "ताप" / "taap" / "bukhar" / "fever" -> "Fever"
  - "पैरों में छाले" / "पायावर फोड" / "chale" / "phode" -> "Foot blisters" or "Oral blisters" / "Mouth lesions"
  - "मुंह से लार" / "झाग" / "laar" / "jhaag" / "drooling" -> "Excessive salivation"
  - "दूध कम" / "दूध कमी" / "dudh kami" / "milk drop" -> "Reduced milk production"
  - "उठता येत नाही" / "नहीं उठ पा रही" / "cannot stand" / "get up" -> "Difficulty standing / inability to stand"
  - "चारा खात नाही" / "खाना नहीं खा रही" / "chara nahi kha" / "not eating" -> "Loss of Appetite"
  - "लंगडत आहे" / "लंगड़ा रही" / "langda" / "limping" -> "Lameness"
  - "त्वचा पर गांठे" / "गाठी" / "nodules" / "lumps" -> "Skin Lesions" or "Skin nodules"
  - "नाकातून पाणी" / "नाक बहना" / "running nose" -> "Nasal Discharge"
  - "डोळ्यातून पाणी" / "आंख से पानी" -> "Eye Discharge"
  - "जुलाब" / "दस्त" / "dast" / "julab" / "loose motion" -> "Diarrhea"
  - "अचानक मरणे" / "अचानक मौत" / "chickens died" -> "Sudden Mortality" or "Increased Mortality"

### 2. STRICT RULES FOR SYMPTOM EXTRACTION:
- **EXHAUSTIVE EXTRACTION:**
  Extract EVERY clinically relevant symptom, sign, production change, behavioral change, physical finding, and relevant health/vaccination information explicitly mentioned in the complaint. Do not stop after finding the most obvious symptom. Do not omit secondary, constitutional, production, mobility, skin, ocular, gastrointestinal, respiratory, or other clinically relevant findings.
- **NO SENTENCE ECHOING:** NEVER copy full sentences or translated phrases as a symptom token!
  - BAD: ["cows is not giving much milk and she is not able to get up"]
  - GOOD: ["Reduced milk production", "Difficulty standing / inability to stand"]
  - BAD: ["मेरी गाय को बुखार है और मुंह से लार निकल रही है"]
  - GOOD: ["Fever", "Excessive salivation"]
- **CONCISE CANONICAL TOKENS:** Each string in "symptoms" MUST be a short (1-4 word) standardized English clinical sign.
- **NO INVENTED FACTS:** Extract ONLY symptoms mentioned or directly implied by the report text. Do not invent unmentioned symptoms, duration, sex, or age.

### 3. VETERINARY DISEASE CLASSIFICATION RULES:
- Evaluate: **Species** + **Symptoms** + **Affected Count** + **Deaths/Mortality** + **Duration/Onset** + **Reproductive/Vaccination Status**.
- **NO GENERIC PLACEHOLDERS:** NEVER return generic useless names like "Clinical Condition", "Suspected Cattle / Cow Clinical Condition", "Animal Health Issue", "Possible condition requiring veterinary triage", or "Likely Cattle Systemic Illness".
- Use your full expert veterinary knowledge to identify specific plausible diseases across all livestock species:
  - **Cattle / Cow / Buffalo:** Foot-and-Mouth Disease (FMD), Lumpy Skin Disease (LSD), Milk Fever (Hypocalcemia) / Downer Cow Syndrome, Bovine Respiratory Disease (BRD), Hemorrhagic Septicemia (HS), Black Quarter (BQ), Mastitis, Bloat / Ruminal Tympany, Theileriosis, Babesiosis, Johne's Disease, Anthrax, Ketosis.
  - **Goats / Sheep:** Peste des Petits Ruminants (PPR), Enterotoxemia, Sheep/Goat Pox, Contagious Caprine Pleuropneumonia (CCPP), Bluetongue, Foot-and-Mouth Disease, Haemonchosis, Coccidiosis, Foot Rot.
  - **Poultry / Chicken:** Newcastle Disease (Ranikhet), Avian Influenza, Infectious Bronchitis, Gumboro (IBD), Fowl Pox, Infectious Coryza, Coccidiosis, Avian Colibacillosis, Mycoplasmosis.
  - **Pig / Swine:** African Swine Fever (ASF), Classical Swine Fever (CSF), PRRS, Erysipelas, Swine Influenza, Colibacillosis.
- **MULTIPLE DIFFERENTIALS:** If symptoms fit multiple diseases, return up to 3 plausible conditions ordered from most likely to alternative differentials (e.g. ["Possible Foot-and-Mouth Disease (FMD)", "Bovine Vesicular Stomatitis"]).
- **USE PLAUSIBLE PREFIXES:** Use "Possible...", "Likely...", "Suspected..." appropriately.
- **DO NOT LIMIT TO A HARDCODED LIST:** Use your broader veterinary medicine knowledge to classify any plausible condition even if not explicitly listed above.

### 4. HANDLING VAGUE OR NON-CLINICAL INPUT:
- If the report is completely vague with NO specific clinical signs (e.g. "My cow is not well", "गाय ठीक नाही आहे", "hello doctor"), DO NOT invent a specific disease or hallucinate symptoms.
- Set "symptoms": [].
- Set "possibleConditions": ["Nonspecific Veterinary Indisposition - Requires Physical Examination"].
- Set "explanation": "The description provided does not report specific clinical symptoms. A physical examination by a qualified veterinary officer is required.".
- Set "recommendations": ["Monitor the animal closely for specific clinical signs such as fever, reduced feed intake, or lesions.", "Contact the local veterinary officer for a physical checkup."].

### 5. STRICT JSON OUTPUT FORMAT:
Return ONLY valid JSON with no markdown wrapping or additional text:
{
  "symptoms": ["Standardized English symptom 1", "Standardized English symptom 2"],
  "possibleConditions": ["Specific Plausible Disease Name 1"],
  "explanation": "Brief 1-2 sentence clinical explanation connecting the symptoms, species, and history.",
  "recommendations": ["Immediate actionable recommendation 1", "Actionable recommendation 2"]
}
`;

/**
 * Builds the user prompt wrapper for symptom extraction and clinical analysis.
 * @param {string} rawText - Unstructured input from voice transcription or text input.
 * @param {string} [species] - Animal species (e.g. 'Cattle', 'Goat', 'Poultry / Chicken', 'Pig / Swine').
 * @returns {string} Formatted user prompt.
 */
export function buildSymptomExtractionUserPrompt(rawText, species = 'Cattle') {
  return `Analyze this veterinary incident report for species "${species}":
"""
${(rawText || '').trim()}
"""

EXHAUSTIVE EXTRACTION:
Extract EVERY clinically relevant symptom, sign, production change, behavioral change, physical finding, and relevant health/vaccination information explicitly mentioned in the complaint. Do not omit secondary, constitutional, production, mobility, skin, ocular, gastrointestinal, respiratory, or other clinically relevant findings.
Normalize all extracted symptoms into concise standardized English clinical labels. Classify the specific plausible veterinary disease/condition.
Return ONLY valid JSON with keys "symptoms", "possibleConditions", "explanation", "recommendations".`;
}



