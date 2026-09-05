/**
 * UI State Machine Constants & Transitions for Farmer AI Symptom Analysis
 */
export const AI_UI_STATES = {
  IDLE: 'IDLE',
  LISTENING: 'LISTENING',
  TRANSCRIPT_READY: 'TRANSCRIPT_READY',
  ANALYZING: 'ANALYZING',
  ANALYSIS_SUCCESS: 'ANALYSIS_SUCCESS',
  ANALYSIS_ERROR: 'ANALYSIS_ERROR',
};

/**
 * Default initial analysis result structure matching exact data contracts
 */
export const DEFAULT_DEV_ANALYSIS_RESULT = {
  symptoms: [
    'High Fever (तीव्र ताप)',
    'Foot blisters (पायावर फोड)',
    'Excessive salivation (तोंडातून लाळ गळणे)',
    'Loss of appetite & limping (चारा न खाणे व लंगडणे)',
  ],
  possibleConditions: [
    {
      name: 'Foot-and-Mouth Disease (FMD / लाळ्या खुरखूत)',
      likelihood: 'High Syndromic Match',
      note: 'Possible condition requiring urgent veterinary evaluation and herd quarantine check.',
    },
    {
      name: 'Bovine Viral Diarrhea (BVD)',
      likelihood: 'Differential Consideration',
      note: 'Secondary differential to rule out during physical examination.',
    },
  ],
  recommendations: [
    'Contact a veterinarian or local paravet immediately for physical examination.',
    'Isolate affected cattle from healthy livestock to minimize transmission risk.',
    'Monitor other animals in your shed twice daily for fever or lesions.',
    'Follow appropriate veterinary guidance regarding disinfectant footbaths.',
  ],
  explanation:
    'Reported cluster of acute fever, excessive drooling, and vesicular foot lesions indicates high priority for syndromic veterinary field triage.',
  disclaimer:
    'AI-generated information is provided as decision support and does not replace professional veterinary diagnosis.',
};

export const MOCK_DEV_ANALYSIS_RESULT = DEFAULT_DEV_ANALYSIS_RESULT;

