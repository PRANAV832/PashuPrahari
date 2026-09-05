const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
      index: true
    },
    farmerName: {
      type: String,
      required: [true, 'farmerName is required'],
      trim: true
    },
    farmerPhone: {
      type: String,
      default: '',
      trim: true
    },
    village: {
      type: String,
      required: [true, 'village is required'],
      trim: true
    },
    taluka: {
      type: String,
      default: '',
      trim: true
    },
    district: {
      type: String,
      default: 'Thane',
      trim: true
    },
    species: {
      type: String,
      required: [true, 'species is required'],
      trim: true
    },
    rawInput: {
      type: String,
      default: ''
    },
    symptoms: {
      type: [String],
      default: []
    },
    affectedAnimals: {
      type: Number,
      default: 1,
      min: [0, 'affectedAnimals cannot be negative']
    },
    deaths: {
      type: Number,
      default: 0,
      min: [0, 'deaths cannot be negative']
    },
    duration: {
      type: String,
      default: 'Unknown'
    },
    vaccinationStatus: {
      type: String,
      default: 'Unknown'
    },
    lat: {
      type: Number,
      default: null
    },
    lng: {
      type: Number,
      default: null
    },
    aiAnalysis: {
      type: {
        possibleConditions: { type: mongoose.Schema.Types.Mixed, default: [] },
        explanation: { type: String, default: '' },
        recommendations: { type: [String], default: [] }
      },
      default: () => ({
        possibleConditions: [],
        explanation: '',
        recommendations: []
      })
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    riskLevel: {
      type: String,
      default: 'Pending'
    },
    status: {
      type: String,
      default: 'Reported'
    },
    assignedTo: {
      type: String,
      default: null,
      trim: true
    },
    assignedVet: {
      type: String,
      default: null,
      trim: true
    },
    assignedVetId: {
      type: String,
      default: null,
      trim: true,
      index: true
    },
    assignedBy: {
      type: String,
      default: null,
      trim: true
    },
    assignedRole: {
      type: String,
      default: null,
      trim: true
    },
    assignedAt: {
      type: String,
      default: null
    },
    investigation: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    },
    treatmentNotes: {
      type: String,
      default: ''
    },
    labReferral: {
      type: Boolean,
      default: false
    },
    labNotes: {
      type: String,
      default: ''
    },
    alertSent: {
      type: Boolean,
      default: false
    },
    alertError: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Virtual transformation to ensure clean JSON output
caseSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret.id || (ret._id ? ret._id.toString() : null);
    if (!ret.assignedVet && ret.assignedTo) {
      ret.assignedVet = ret.assignedTo;
    }
    if (!ret.assignedTo && ret.assignedVet) {
      ret.assignedTo = ret.assignedVet;
    }
    return ret;
  }
});

module.exports = mongoose.model('Case', caseSchema);
