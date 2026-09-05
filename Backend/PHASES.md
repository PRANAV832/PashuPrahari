### File 3: `PHASES.md` (Team Execution Plan)
Copy this entire block and save it as `PHASES.md` in your root directory.

```markdown
# Development Phases & Task Distribution — PashuPrahari

## Phase 1: Core Platform & Manual Data Flow (Hours 0–24)
- **Member 1 (Frontend — Dilip):** Scaffold Vite React app. Build manual reporting form (`ReportForm.jsx`) and basic dashboard table. Initialize `react-leaflet` map centered on Bhiwandi/Mumbai.
- **Member 2 (Backend):** Set up Node/Express server and database models for `Case`. Build `POST /api/reports` and `GET /api/cases`.
- **Member 3 (AI & Rules):** Set up AI API integration and draft the strict system prompt for symptom extraction. Write baseline JS risk scoring function.

## Phase 2: Voice AI & Geospatial Mapping (Hours 24–48)
- **Member 1 (Frontend):** Integrate HTML5 Web Speech API into form for Hindi/Marathi capture. Display real-time transcription and AI analysis breakdown UI.
- **Member 2 (Backend):** Wire pipeline: `Raw Text ➔ AI API ➔ Risk Engine ➔ Database persistence`. Expose case status update endpoints.
- **Member 3 (AI & Rules):** Refine prompt for code-switched vernacular input. Finalize 0–100 risk score breakdown and explanation text. Ensure coordinates flow cleanly to the map.

## Phase 3: Outbreak Simulation, SMS & Polish (Hours 48–72)
- **Member 1 (Frontend):** Add risk/status filters to dashboard. Build `AlertModal.jsx` component for outbreak warnings. Implement offline localStorage sync toggle.
- **Member 2 (Backend):** Integrate Twilio SMS API trigger for High/Critical risks. Build `injectOutbreak.js` seed script for demo clustering.
- **Member 3 (AI & Rules):** Stress test edge cases. Implement fallback mock responses for API timeouts during presentation. Rehearse live script.