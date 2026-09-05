const express = require('express');
const router = express.Router();
const {
  createReport,
  analyzeReport,
  getCases,
  getCaseById,
  updateCase
} = require('../controllers/caseController');
const { validateReport } = require('../middleware/validateReport');
const { authenticate } = require('../middleware/authMiddleware');

// Apply authentication middleware to resolve caller identity
router.use(authenticate);

// POST /api/reports - Submit a livestock report
router.post('/reports', validateReport, createReport);

// POST /api/analyze - Real-time AI symptom extraction & triage preview
router.post('/analyze', analyzeReport);

// GET /api/cases - Retrieve cases (scoped by authenticated user role)
router.get('/cases', getCases);

// GET /api/cases/:id - Retrieve case by ID (guarded for assigned veterinarians)
router.get('/cases/:id', getCaseById);

// PATCH /api/cases/:id - Update case fields (guarded by role and assignment)
router.patch('/cases/:id', updateCase);

module.exports = router;
