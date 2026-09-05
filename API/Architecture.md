# Architecture Documentation — PashuPrahari

## 1. System Overview
[React Frontend + Web Speech API]
│ (REST / JSON Payload)
▼
[Node.js / Express API Gateway]
├──► [OpenAI / Gemini API] (LLM Text-to-JSON Extraction)
├──► [JavaScript Rule Engine] (Deterministic Risk Scoring)
└──► [Database: MongoDB / PostgreSQL] (Persists Cases & Lat/Lng)
│
├──► [React Leaflet Map] (Geospatial Clustering & Geofences)
└──► [Twilio SMS API] (Outbound Regional Alerts)
## 2. Tech Stack Specifications
- **Frontend:** React.js (Vite), Tailwind CSS, `react-leaflet`, Axios.
- **Backend:** Node.js, Express.js, Mongoose / PostgreSQL driver.
- **AI Layer:** OpenAI or Gemini REST API (Structured JSON output mode).
- **Messaging:** Twilio SMS Node SDK.

## 3. Core Data Contracts (JSON Schema)
### Report / Case Submission Payload (`POST /api/reports`)
```json
{
  "farmerName": "Ramesh Patil",
  "village": "Anjeer Phata, Bhiwandi",
  "lat": 19.3002,
  "lng": 73.0597,
  "species": "Bovine",
  "rawText": "Meri gaay ko bukhar hai aur pair mein chale hain.",
  "symptoms": ["Fever", "Blisters"],
  "riskScore": 85,
  "riskLevel": "High",
  "status": "Reported"
}
