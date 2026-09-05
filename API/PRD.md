# Product Requirements Document (PRD) — PashuPrahari (पशुप्रहरी)

## 1. Executive Summary
PashuPrahari is an offline-first, multi-channel syndromic surveillance and decision-support platform for livestock health. It bridges the gap between rural livestock owners, field paravets, and district veterinary administrations by enabling vernacular voice reporting, explainable risk scoring, geospatial outbreak mapping, and automated geofenced alerting.

## 2. Target User Personas
- **Farmer / Livestock Owner:** Rural user with low digital literacy who needs a dead-simple voice-first reporting method.
- **Pashu Sakhi / Field Paravet:** Grassroots healthcare worker who needs quick mobile data entry with offline sync capability.
- **District Veterinary Officer (DVO):** Government administrator who needs real-time map dashboards, early outbreak clusters, and automated alert tools.

## 3. Scope of MVP (Hackathon Version)
- **Voice-First Input:** HTML5 Web Speech API capturing Hindi/Marathi/English speech on the frontend.
- **AI Symptom Extraction:** Backend LLM integration parsing unstructured text into a clean JSON symptom array.
- **Rule-Based Triage Engine:** Deterministic JavaScript logic calculating transparent 0–100 risk scores.
- **Geospatial Dashboard:** React-Leaflet map rendering GPS pins, dynamic clusters, and 10km geofences.
- **Automated Messaging:** Twilio SMS API integration dispatching localized regional warnings when high-risk thresholds are crossed.
- **Case Management:** Lifecycle tracking from `Reported` to `Resolved`.

## 4. Key Functional Requirements
- **FR-01:** Frontend must capture speech via Web Speech API and display live transcription.
- **FR-02:** Backend must accept text, query LLM API with strict JSON system prompt, and extract normalized clinical symptom tokens.
- **FR-03:** Backend must execute deterministic scoring rules to flag risk tiers (`Low`, `Moderate`, `High`, `Critical`).
- **FR-04:** Frontend dashboard must plot coordinates (`lat`, `lng`) on an interactive Leaflet map with clustering.
- **FR-05:** Backend must trigger Twilio SMS alerts for high-risk outbreaks.