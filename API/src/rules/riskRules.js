/**
 * @file riskRules.js
 * @description Centralized symptom weights, syndromic synergies, and risk classification thresholds.
 * Easily configurable for veterinary calibration and SIH demonstration.
 */

/**
 * Baseline weights assigned to individual clinical symptoms (0–100 scale).
 */
export const SYMPTOM_WEIGHTS = {
  // High-impact mucosal and epidermal markers
  'Blisters': {
    weight: 50,
    category: 'Vesicular / Epidermal',
    description: 'High-consequence mucosal/epidermal lesion (e.g. FMD / Vesicular disease flag)'
  },
  'Foot blisters': {
    weight: 50,
    category: 'Vesicular / Epidermal',
    description: 'High-consequence foot mucosal/epidermal lesion (e.g. FMD flag)'
  },
  'Oral blisters': {
    weight: 50,
    category: 'Vesicular / Epidermal',
    description: 'High-consequence oral mucosal blister (e.g. FMD flag)'
  },
  'Mouth lesions': {
    weight: 50,
    category: 'Vesicular / Epidermal',
    description: 'High-consequence mouth mucosal lesion (e.g. FMD flag)'
  },
  'Mouth ulcers': {
    weight: 45,
    category: 'Vesicular / Epidermal',
    description: 'Oral ulcerative lesion marker'
  },
  'Oral ulcers': {
    weight: 45,
    category: 'Vesicular / Epidermal',
    description: 'Oral ulcerative lesion marker'
  },
  'Sudden Mortality': {
    weight: 50,
    category: 'Fatality / Mortality',
    description: 'Acute peracute fatality / high mortality event flag'
  },
  'Increased Mortality': {
    weight: 50,
    category: 'Fatality / Mortality',
    description: 'Flock/herd elevated mortality event flag'
  },
  'Respiratory Distress': {
    weight: 45,
    category: 'Cardiopulmonary',
    description: 'Severe acute respiratory compromise / dyspnea'
  },
  'Bleeding': {
    weight: 45,
    category: 'Hemorrhagic',
    description: 'Hemorrhagic manifestation (high acute fatality risk)'
  },
  'Skin Lesions': {
    weight: 40,
    category: 'Dermatological',
    description: 'Acute nodular/vesicular outbreak marker (e.g. Lumpy Skin Disease flag)'
  },
  'Skin nodules': {
    weight: 40,
    category: 'Dermatological',
    description: 'Acute skin nodule marker (LSD flag)'
  },
  'Skin lumps': {
    weight: 40,
    category: 'Dermatological',
    description: 'Acute skin lump marker (LSD flag)'
  },
  'Skin discoloration': {
    weight: 35,
    category: 'Circulatory / Dermatological',
    description: 'Cyanosis / purple skin patch marker (e.g. African Swine Fever flag)'
  },
  'Purple skin': {
    weight: 35,
    category: 'Circulatory / Dermatological',
    description: 'Cyanotic skin hemorrhage marker'
  },
  'Abortion': {
    weight: 40,
    category: 'Reproductive',
    description: 'Acute storm abortion / reproductive pathogen flag (e.g. Brucellosis)'
  },
  'Fever': {
    weight: 35,
    category: 'Systemic',
    description: 'Acute systemic pyrexia / infectious marker'
  },
  'High fever': {
    weight: 40,
    category: 'Systemic',
    description: 'High systemic pyrexia / hyperthermia marker'
  },
  'Difficulty standing / inability to stand': {
    weight: 35,
    category: 'Neuromuscular / Production',
    description: 'Severe recumbency / inability to rise / metabolic crash (e.g. Milk Fever)'
  },
  'Salivation': {
    weight: 30,
    category: 'Oral / Mucosal',
    description: 'Profuse drooling / oral mucosal irritation'
  },
  'Excessive salivation': {
    weight: 30,
    category: 'Oral / Mucosal',
    description: 'Profuse drooling / oral mucosal irritation'
  },
  'Lameness': {
    weight: 25,
    category: 'Locomotor',
    description: 'Locomotor impairment / hoof lesion marker'
  },
  'Difficulty walking': {
    weight: 25,
    category: 'Locomotor',
    description: 'Locomotor impairment / gait abnormality'
  },
  'Diarrhea': {
    weight: 25,
    category: 'Gastrointestinal',
    description: 'Acute gastrointestinal enteritis'
  },
  'Bloody diarrhea': {
    weight: 35,
    category: 'Gastrointestinal / Hemorrhagic',
    description: 'Severe hemorrhagic enteritis'
  },
  'Loss of Appetite': {
    weight: 20,
    category: 'General',
    description: 'Anorexia / general systemic morbidity'
  },
  'Reduced appetite': {
    weight: 20,
    category: 'General',
    description: 'Partial feed refusal'
  },
  'Complete anorexia': {
    weight: 25,
    category: 'General',
    description: 'Total feed refusal'
  },
  'Reduced milk production': {
    weight: 20,
    category: 'Production',
    description: 'Acute reduction in milk output'
  },
  'Drop in Milk Yield': {
    weight: 20,
    category: 'Production',
    description: 'Acute drop in lactation output'
  },
  'Sudden milk drop': {
    weight: 25,
    category: 'Production',
    description: 'Precipitous drop in milk output'
  },
  'Swelling': {
    weight: 20,
    category: 'Inflammatory',
    description: 'Localized or generalized edema'
  },
  'Cough': {
    weight: 20,
    category: 'Respiratory',
    description: 'Moderate respiratory cough'
  },
  'Mild Cough': {
    weight: 15,
    category: 'Respiratory',
    description: 'Mild localized upper respiratory irritation'
  },
  'Severe cough': {
    weight: 25,
    category: 'Respiratory',
    description: 'Severe deep paroxysmal cough'
  },
  'Eye Discharge': {
    weight: 15,
    category: 'Ocular',
    description: 'Ocular mucosal discharge'
  },
  'Nasal Discharge': {
    weight: 15,
    category: 'Respiratory',
    description: 'Nasal mucosal exudate'
  },
  'Shivering': {
    weight: 15,
    category: 'Systemic',
    description: 'Tremors / chills during febrile onset'
  },
  'Lethargy': {
    weight: 15,
    category: 'General',
    description: 'Dullness / depressed activity'
  },
  'Weakness': {
    weight: 15,
    category: 'General',
    description: 'Muscular weakness / asthenia'
  },
  'Bloat': {
    weight: 25,
    category: 'Gastrointestinal',
    description: 'Rumen tympany / abdominal distension'
  },
  'Constipation': {
    weight: 15,
    category: 'Gastrointestinal',
    description: 'Digestive stagnation'
  }
};

/**
 * Default fallback weight for unknown symptoms to ensure graceful handling.
 */
export const DEFAULT_UNKNOWN_SYMPTOM_WEIGHT = 5;

/**
 * Syndromic combination rules for veterinary epidemiological alerting.
 * When specific clusters appear together, they trigger bonus points and descriptive alerts.
 */
export const SYNDROMIC_COMBINATIONS = [
  {
    name: 'Foot and Mouth Disease (FMD) Syndrome',
    requiredSymptoms: ['Fever', 'Blisters'],
    bonusPoints: 0,
    alertDescription: 'Classic Vesicular Syndrome: Highly contagious FMD suspicion'
  },
  {
    name: 'Foot and Mouth Disease (FMD) Syndrome',
    requiredSymptoms: ['Fever', 'Foot blisters'],
    bonusPoints: 0,
    alertDescription: 'Classic Vesicular Syndrome: Highly contagious FMD suspicion'
  },
  {
    name: 'Foot and Mouth Disease (FMD) Syndrome',
    requiredSymptoms: ['High fever', 'Foot blisters'],
    bonusPoints: 0,
    alertDescription: 'Classic Vesicular Syndrome: Highly contagious FMD suspicion'
  },
  {
    name: 'Foot and Mouth Disease (FMD) Syndrome',
    requiredSymptoms: ['Fever', 'Oral blisters'],
    bonusPoints: 0,
    alertDescription: 'Classic Vesicular Syndrome: Highly contagious FMD suspicion'
  },
  {
    name: 'Milk Fever / Metabolic Recumbency Syndrome',
    requiredSymptoms: ['Reduced milk production', 'Difficulty standing / inability to stand'],
    bonusPoints: 15,
    alertDescription: 'Metabolic hypocalcemia / Downer cow crisis flag'
  },
  {
    name: 'Lumpy Skin Disease (LSD) Syndrome',
    requiredSymptoms: ['Fever', 'Skin Lesions'],
    bonusPoints: 10,
    alertDescription: 'Acute Nodular Syndrome: LSD suspicion'
  },
  {
    name: 'Lumpy Skin Disease (LSD) Syndrome',
    requiredSymptoms: ['Fever', 'Skin nodules'],
    bonusPoints: 10,
    alertDescription: 'Acute Nodular Syndrome: LSD suspicion'
  },
  {
    name: 'Acute Hemorrhagic / Septicemia Cluster',
    requiredSymptoms: ['Fever', 'Respiratory Distress', 'Bleeding'],
    bonusPoints: 15,
    alertDescription: 'Hyper-acute septicemic/hemorrhagic crisis flag'
  }
];

/**
 * Risk Level Thresholds matching PRD and Architecture data contracts.
 */
export const RISK_THRESHOLDS = [
  { min: 86, max: 100, level: 'Critical', color: '#DC2626', action: 'Immediate DVO dispatch & Geofence SMS Trigger' },
  { min: 60, max: 85, level: 'High', color: '#EA580C', action: 'Paravet priority inspection within 6 hours' },
  { min: 30, max: 59, level: 'Moderate', color: '#CA8A04', action: 'Field monitoring & follow-up within 24 hours' },
  { min: 0, max: 29, level: 'Low', color: '#16A34A', action: 'Standard home advisory & observation' }
];

/**
 * Common symptom aliases and vernacular mappings to standard tokens.
 */
export const SYMPTOM_ALIASES = {
  'fever': 'Fever',
  'high fever': 'High fever',
  'high temperature': 'High fever',
  'bukhar': 'Fever',
  'taap': 'Fever',
  'blister': 'Blisters',
  'blisters': 'Blisters',
  'oral blisters': 'Oral blisters',
  'mouth blisters': 'Oral blisters',
  'mouth lesions': 'Mouth lesions',
  'oral ulcers': 'Oral ulcers',
  'mouth ulcers': 'Mouth ulcers',
  'chale': 'Blisters',
  'phod': 'Blisters',
  'phode': 'Blisters',
  'mouth blister': 'Oral blisters',
  'foot blister': 'Foot blisters',
  'foot blisters': 'Foot blisters',
  'foot blisters / vesicles': 'Foot blisters',
  'blisters on foot': 'Foot blisters',
  'blisters on feet': 'Foot blisters',
  'reduced milk production': 'Reduced milk production',
  'drop in milk yield': 'Drop in Milk Yield',
  'sudden milk drop': 'Sudden milk drop',
  'not giving much milk': 'Reduced milk production',
  'not producing much milk': 'Reduced milk production',
  'difficulty standing / inability to stand': 'Difficulty standing / inability to stand',
  'inability to stand': 'Difficulty standing / inability to stand',
  'difficulty standing': 'Difficulty standing / inability to stand',
  'unable to stand': 'Difficulty standing / inability to stand',
  'not able to get up': 'Difficulty standing / inability to stand',
  'salivation': 'Salivation',
  'excessive salivation': 'Excessive salivation',
  'drooling': 'Excessive salivation',
  'froth': 'Excessive salivation',
  'jhaag': 'Excessive salivation',
  'laar': 'Excessive salivation',
  'lameness': 'Lameness',
  'limping': 'Lameness',
  'langdana': 'Lameness',
  'difficulty walking': 'Difficulty walking',
  'difficulty walking / lameness': 'Lameness',
  'unable to walk': 'Lameness',
  'loss of appetite': 'Loss of Appetite',
  'reduced appetite': 'Reduced appetite',
  'anorexia': 'Complete anorexia',
  'complete anorexia': 'Complete anorexia',
  'loss of appetite / reduced feed intake': 'Loss of Appetite',
  'reduced feed intake': 'Reduced feed intake',
  'not eating': 'Loss of Appetite',
  'chara nahi kha rahi': 'Loss of Appetite',
  'cough': 'Cough',
  'mild cough': 'Mild Cough',
  'severe cough': 'Severe cough',
  'khansi': 'Cough',
  'skin lesions': 'Skin Lesions',
  'skin nodules': 'Skin nodules',
  'skin lumps': 'Skin lumps',
  'skin lesion': 'Skin Lesions',
  'lumps': 'Skin lumps',
  'nodules': 'Skin nodules',
  'respiratory distress': 'Respiratory Distress',
  'difficulty breathing': 'Respiratory Distress',
  'diarrhea': 'Diarrhea',
  'bloody diarrhea': 'Bloody diarrhea',
  'watery diarrhea': 'Watery diarrhea',
  'loose motion': 'Diarrhea',
  'lethargy': 'Lethargy',
  'weakness': 'Weakness',
  'sudden mortality': 'Sudden Mortality',
  'increased mortality': 'Increased Mortality',
  'skin discoloration': 'Skin discoloration',
  'purple skin': 'Purple skin',
  'cyanosis': 'Cyanosis'
};

