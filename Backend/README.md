# PashuPrahari (पशुप्रहरी) — Backend API

Node.js / Express backend API for livestock health syndromic surveillance.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and set your configuration parameters:
```bash
cp .env.example .env
```
Default `.env` settings:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pashuprahari
```

### 3. Run Server
- **Production Mode:**
  ```bash
  npm start
  ```
- **Development Mode (with auto-reload):**
  ```bash
  npm run dev
  ```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend status check |
| `POST` | `/api/reports` | Submit a new livestock health report |
| `GET` | `/api/cases` | Get all submitted cases (sorted newest first) |
| `GET` | `/api/cases/:id` | Get details of a single case by ID |
| `PATCH` | `/api/cases/:id` | Update case fields (e.g. status) |

---

## 📝 Sample API Requests & Responses

### 1. Health Check
`GET http://localhost:5000/api/health`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "PashuPrahari backend is running"
}
```

### 2. Submit Manual Report
`POST http://localhost:5000/api/reports`

**Header:** `Content-Type: application/json`

**Payload:**
```json
{
  "farmerName": "Ramesh",
  "village": "Anjeer Phata, Bhiwandi",
  "species": "Cattle",
  "rawInput": "Meri gaay ko bukhar hai aur pair mein chale hain.",
  "symptoms": [
    "Fever",
    "Foot blisters"
  ],
  "affectedAnimals": 5,
  "deaths": 0,
  "duration": "2 days",
  "vaccinationStatus": "Unknown",
  "lat": 19.3002,
  "lng": 73.0597
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Case created successfully",
  "case": {
    "farmerName": "Ramesh",
    "village": "Anjeer Phata, Bhiwandi",
    "species": "Cattle",
    "rawInput": "Meri gaay ko bukhar hai aur pair mein chale hain.",
    "symptoms": [
      "Fever",
      "Foot blisters"
    ],
    "affectedAnimals": 5,
    "deaths": 0,
    "duration": "2 days",
    "vaccinationStatus": "Unknown",
    "lat": 19.3002,
    "lng": 73.0597,
    "aiAnalysis": {
      "possibleConditions": [],
      "explanation": "",
      "recommendations": []
    },
    "riskScore": 0,
    "riskLevel": "Pending",
    "status": "Reported",
    "_id": "66ce3f8a0000000000000001",
    "createdAt": "2026-08-27T14:00:00.000Z",
    "updatedAt": "2026-08-27T14:00:00.000Z",
    "id": "66ce3f8a0000000000000001"
  }
}
```

### 3. Get All Cases
`GET http://localhost:5000/api/cases`

**Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "cases": [
    {
      "id": "66ce3f8a0000000000000001",
      "farmerName": "Ramesh",
      "village": "Anjeer Phata, Bhiwandi",
      "species": "Cattle",
      "lat": 19.3002,
      "lng": 73.0597,
      "riskLevel": "Pending",
      "status": "Reported"
    }
  ]
}
```
