# PashuPrahari (पशुप्रहरी) — AI & Rules Layer

**Module:** Member 3 (AI & Rules) — Day 1 Deliverable  
**Stack:** Node.js (ESM), Google Gemini / OpenAI REST APIs, Deterministic Pure JavaScript Risk Engine.

---

## 1. Overview

This module provides two core decoupled functionalities for PashuPrahari:
1. **AI Symptom Extraction:** Converts raw, unstructured, multilingual vernacular voice/text inputs (Hindi, Marathi, English, Hinglish, Marathiglish) into a standardized array of clinical symptom tokens using a strict system prompt and resilient JSON sanitization.
2. **Deterministic Risk Engine:** A pure JavaScript rule-based engine that evaluates symptoms, computes a 0–100 risk score, assigns a PRD-compliant risk level (`Low`, `Moderate`, `High`, `Critical`), and generates an explainable breakdown for veterinary decision support.

---

## 2. Integration Interface for Member 2 (Backend)

Member 2 can import either individual functions or the unified `processReport` pipeline in the Express route controllers (`POST /api/reports`):

```javascript
import { processReport, extractSymptoms, calculateRisk } from './src/index.js';

// Option A: End-to-End Pipeline Helper
const reportResult = await processReport(req.body.rawText);
/*
Returns:
{
  rawText: "Meri gaay ko bukhar hai aur pair mein chale hain.",
  symptoms: ["Fever", "Blisters"],
  riskScore: 85,
  riskLevel: "High",
  breakdown: [
    { symptom: "Fever", weight: 35, category: "Systemic", description: "Acute systemic pyrexia / infectious marker" },
    { symptom: "Blisters", weight: 50, category: "Vesicular / Epidermal", description: "High-consequence mucosal/epidermal lesion" }
  ],
  syndromesDetected: [...],
  recommendedAction: "Paravet priority inspection within 6 hours",
  status: "Reported"
}
*/

// Option B: Modular Step-by-Step
const { symptoms } = await extractSymptoms(req.body.rawText);
const { riskScore, riskLevel, breakdown } = calculateRisk(symptoms);
```

---

## 3. Risk Engine Baseline Rules & Thresholds

### Symptom Weights Table (0–100 Scale)
| Symptom Token | Base Weight | Category | Clinical Description / Flag |
|---|:---:|---|---|
| `Blisters` | **50** | Vesicular / Epidermal | High-consequence mucosal/epidermal lesion (FMD flag) |
| `Respiratory Distress` | **45** | Cardiopulmonary | Severe acute respiratory compromise / dyspnea |
| `Bleeding` | **45** | Hemorrhagic | Hemorrhagic manifestation (acute fatality risk) |
| `Skin Lesions` | **40** | Dermatological | Acute nodular outbreak marker (Lumpy Skin Disease flag) |
| `Abortion` | **40** | Reproductive | Storm abortion / reproductive pathogen (Brucellosis flag) |
| `Fever` | **35** | Systemic | Acute systemic pyrexia / infectious marker |
| `Salivation` | **30** | Oral / Mucosal | Profuse drooling / oral mucosal irritation |
| `Lameness` | **25** | Locomotor | Locomotor impairment / hoof lesion marker |
| `Diarrhea` | **25** | Gastrointestinal | Acute gastrointestinal enteritis |
| `Bloat` | **25** | Gastrointestinal | Rumen tympany / abdominal distension |
| `Loss of Appetite` | **20** | General | Anorexia / general systemic morbidity |
| `Drop in Milk Yield` | **20** | Production | Acute drop in lactation output |
| `Swelling` | **20** | Inflammatory | Localized or generalized edema |
| `Cough` | **20** | Respiratory | Moderate respiratory cough |
| `Mild Cough` | **15** | Respiratory | Mild localized upper respiratory irritation |
| `Eye Discharge` | **15** | Ocular | Ocular mucosal discharge |
| `Nasal Discharge` | **15** | Respiratory | Nasal mucosal exudate |
| `Shivering` | **15** | Systemic | Tremors / chills during febrile onset |
| `Lethargy` | **15** | General | Dullness / depressed activity |
| `Constipation` | **15** | Gastrointestinal | Digestive stagnation |
| `Unknown` (unrecognized) | **5** | Unclassified | Safe minimal fallback weight |

### Risk Level Tiers & Thresholds
| Score Range | Risk Level | Action Directive |
|:---:|:---:|---|
| **86 – 100** | `Critical` | Immediate DVO dispatch & Geofence SMS Trigger |
| **60 – 85** | `High` | Paravet priority inspection within 6 hours |
| **30 – 59** | `Moderate` | Field monitoring & follow-up within 24 hours |
| **0 – 29** | `Low` | Standard home advisory & observation |

---

## 4. Running Tests & Demo

```bash
# Run unit test suite (100% offline, no API key required)
npm test

# Run interactive CLI demonstration
npm run demo
```
