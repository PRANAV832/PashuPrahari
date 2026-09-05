# PashuPrahari (पशुप्रहरी) 🐾
### Real-Time Syndromic Surveillance & Early Outbreak Detection System for Livestock

PashuPrahari is an intelligent, bilingual livestock health monitoring and disease outbreak surveillance platform designed to empower rural farmers, field veterinarians, and livestock department administrators with real-time reporting, automated risk scoring, AI-driven symptom analysis, and geospatial outbreak tracking.

---

## 🏗️ Architecture Overview

The repository is modularly structured into three core domains:

```
PashuPrahari/
├── Frontend/           # React 18 + Vite + TailwindCSS + Leaflet GIS mapping
├── Backend/            # Node.js + Express + MongoDB REST API & Twilio SMS service
├── API/                # Gemini AI LLM symptom parsing & deterministic risk scoring engine
├── .env.example        # Master environment variable template with placeholders
├── .gitignore          # Production Git ignore protecting secrets, node_modules, and builds
└── README.md           # Master project documentation
```

### 1. Frontend (`/Frontend`)
- Modern, responsive interface built with React 18, Vite, and TailwindCSS.
- **Multilingual Farmer Reporting:** Voice-assisted reporting in English, Hindi (हिन्दी), and Marathi (मराठी).
- **Flexible Location Input:** One-tap GPS auto-detection or precise manual Latitude & Longitude coordinate entry.
- **Interactive GIS Map:** Real-time outbreak heatmaps and clustered geofences powered by Leaflet and OpenStreetMap.
- **Role-Based Portals:** Dedicated interfaces for Farmers, Field Veterinarians, and District Administrators.

### 2. Backend (`/Backend`)
- Express.js REST API with resilient MongoDB schema models.
- In-memory fallback support ensuring full system availability even if local MongoDB is temporarily offline.
- **Automated Alerting:** Twilio SMS integration sending real-time warnings to veterinary officers when high or critical outbreaks are detected.
- Built-in demonstration seed script (`injectOutbreak.js`) for outbreak simulation.

### 3. AI & Rules Engine (`/API`)
- Dual-layer syndromic analysis:
  - **Generative AI Layer:** Google Gemini (or OpenAI fallback) extraction of clinical symptoms and condition differentials from natural vernacular input.
  - **Deterministic Rule Engine:** Standardized veterinary risk scoring calculating severity scores (0–100) and priority levels (`Low`, `Moderate`, `High`, `Critical`).

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or later
- **npm**: v9.0.0 or later
- **MongoDB**: Community Server (v6.0+) running locally or a MongoDB Atlas URI

---

### Step 1: Clone Repository
```bash
git clone https://github.com/<your-username>/pashuprahari.git
cd pashuprahari
```

---

### Step 2: Environment Configuration
Copy the `.env.example` file to create your local `.env` configuration files:

```bash
# In Backend
cp Backend/.env.example Backend/.env

# In API (optional, if running standalone API tests)
cp API/.env.example API/.env
```

Open `Backend/.env` and configure your credentials:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pashuprahari
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Twilio SMS Alert Service (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_API_KEY_SID=your_restricted_api_key_sid_here
TWILIO_API_KEY_SECRET=your_restricted_api_key_secret_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
ALERT_RECIPIENT_PHONE=+919876543210
```

---

### Step 3: Install Dependencies

#### Install Backend Dependencies:
```bash
cd Backend
npm install
```

#### Install Frontend Dependencies:
```bash
cd ../Frontend
npm install
```

---

### Step 4: Run Application

#### 1. Start Backend Server:
```bash
cd Backend
npm start
# Server starts at http://localhost:5000
```

#### 2. Start Frontend Dev Server:
```bash
cd Frontend
npm run dev
# Frontend accessible at http://localhost:5173
```

---

## 🧪 Testing

- **Backend Health Check:** `GET http://localhost:5000/api/health`
- **Simulate Demo Outbreak:** `node Backend/injectOutbreak.js`
- **Run AI & Rule Engine Unit Tests:**
  ```bash
  cd API
  npm test
  ```

---

## 🔒 Security & Privacy

- All sensitive keys (Gemini API tokens, Twilio credentials, database connection strings) are strictly managed via environment variables and excluded from version control via `.gitignore`.
- Unit tests use explicitly simulated placeholder tokens.
- No personal identifiable credentials or live API keys are committed to this repository.

---

## 📜 License
This project is developed under the MIT License for the Smart India Hackathon (SIH 2026).
