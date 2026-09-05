/**
 * Isolated Veterinarian Mock Data & Investigation Store
 * Pre-populated with realistic clinical findings, AI analysis objects, and laboratory workflows.
 */

export const VET_STATUS_OPTIONS = [
  { value: 'UNDER_INVESTIGATION', label: 'Under Investigation', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { value: 'SUSPECTED',           label: 'Suspected',           color: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  { value: 'CONFIRMED',           label: 'Confirmed',           color: 'bg-red-50 text-red-800 border-red-200' },
  { value: 'RESPONSE',            label: 'Response Deployed',   color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { value: 'MONITORING',          label: 'Monitoring',          color: 'bg-teal-50 text-teal-800 border-teal-200' },
  { value: 'RESOLVED',            label: 'Resolved',            color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export const RISK_ORDER = {
  CRITICAL: 1,
  HIGH: 2,
  MODERATE: 3,
  LOW: 4,
};

export const INITIAL_VET_INVESTIGATION_CASES = [
  {
    id: 'CASE-1002',
    farmerName: 'Sunita Gaikwad',
    contact: '+91 99887 76655',
    village: 'Padgha',
    taluka: 'Bhiwandi',
    district: 'Thane',
    state: 'Maharashtra',
    species: 'Bovine (Buffalo / म्हैस)',
    affectedAnimals: 12,
    deaths: 3,
    duration: '3 to 5 days (3-5 दिवस)',
    vaccinationStatus: 'Partially Vaccinated (लसीकरण अपूर्ण)',
    latitude: 19.3512,
    longitude: 73.1624,
    riskScore: 94,
    riskLevel: 'CRITICAL',
    status: 'UNDER_INVESTIGATION',
    assignedVet: 'Dr. Anand Deshmukh',
    assignedDate: '2026-08-27T11:30:00Z',
    reportedAt: '2026-08-27T11:00:00Z',
    lastUpdatedAt: '2026-08-28T09:15:00Z',

    // Original verbatim statement as reported by the farmer
    originalFarmerReport:
      'माझ्या 12 म्हशींना गेल्या 3 दिवसांपासून तीव्र ताप (105°F) आहे, तोंडावर, जिभेवर आणि खुरच्या मधात मोठे फोड आले आहेत, भरपूर लाळ गळत आहे आणि त्या लंगडत आहेत. चारा खाणे पूर्ण बंद झाले आहे आणि 3 म्हशींचा आज सकाळी मृत्यू झाला आहे.',

    // AI Analysis Object matching exact props contract
    aiAnalysis: {
      symptoms: [
        'Acute High Fever (105°F)',
        'Vesicular oral & tongue lesions',
        'Interdigital foot blisters with lameness',
        'Excessive ropy salivation',
        'Mortality cluster (3 deaths)',
      ],
      possibleConditions: [
        {
          name: 'Foot-and-Mouth Disease (FMD / लाळ्या खुरखूत - Aphtae epizooticae)',
          likelihood: 'High Syndromic Match (94%)',
          note: 'Vesicular oral/interdigital lesion cluster with rapid shed transmission indicates critical FMD alert.',
        },
        {
          name: 'Bovine Malignant Catarrhal Fever (MCF)',
          likelihood: 'Differential Consideration',
          note: 'Secondary differential for mucosal erosions requiring lab serology confirmation.',
        },
      ],
      recommendations: [
        'Establish 5km emergency ring quarantine around Gaikwad dairy shed immediately.',
        'Collect vesicle fluid and epithelial flap samples in glycerol-phosphate buffer for PCR test.',
        'Administer supportive antipyretic analgesics and antiseptic potassium permanganate footbaths.',
        'Issue bio-security alert to Padgha Livestock Market.',
      ],
      explanation:
        'Reported combination of acute high mortality, drooling salivation, and interdigital blisters matches classic Aphthovirus epizootic pattern. Urgent containment required.',
      disclaimer:
        'AI-generated information is provided as decision support and does not replace professional veterinary diagnosis.',
    },

    // Clinical Investigation Fields
    investigation: {
      findings: 'Severe bilateral interdigital ulcerations with ruptured oral vesicles observed on physical examination of 9 surviving buffaloes. Rectal temperature recorded at 104.8°F in 5 animals.',
      clinicalObservations: 'Cardiovascular auscultation reveals mild tachycardia. Mucous membranes hyperemic with painful erosions on dental pad and dorsum of tongue. Significant drop in rumen motility.',
      sampleCollected: true,
      sampleType: 'Vesicular fluid & epithelial tissue flaps in 50% phosphate-buffered glycerol',
      sampleTubeId: 'TUBE-MH-2026-FMD-8802',
      sampleDate: '2026-08-27T14:30:00Z',
      labReferral: true,
      labName: 'State Disease Diagnostic Laboratory (SDDL), Pune',
      labReferralNumber: 'REF-SDDL-2026-7714',
      treatmentTaken: 'Intramuscular Flunixin Meglumine (anti-inflammatory) + Long-acting Oxytetracycline for secondary bacterial infection prevention. Oral spray of boroglycerine and 2% potassium permanganate footbaths twice daily.',
      notes: 'Shed isolated with lime powder perimeter. Neighboring 8 dairy holdings in 1km radius instructed on strict movement prohibition.',
    },
  },

  {
    id: 'CASE-1005',
    farmerName: 'Meena Kamble',
    contact: '+91 98112 33445',
    village: 'Vasind',
    taluka: 'Shahapur',
    district: 'Thane',
    state: 'Maharashtra',
    species: 'Poultry (Chicken / कोंबडी)',
    affectedAnimals: 85,
    deaths: 22,
    duration: 'Less than 24 hours (24 तासांपेक्षा कमी)',
    vaccinationStatus: 'Not Vaccinated',
    latitude: 19.4010,
    longitude: 73.2800,
    riskScore: 97,
    riskLevel: 'CRITICAL',
    status: 'RESPONSE',
    assignedVet: 'Dr. Anand Deshmukh',
    assignedDate: '2026-08-27T07:15:00Z',
    reportedAt: '2026-08-27T06:00:00Z',
    lastUpdatedAt: '2026-08-27T16:00:00Z',
    originalFarmerReport:
      'कोंबड्या अचानक मरत आहेत. सकाळी 22 कोंबड्या मरण पावल्या. तुरा निळा पडला आहे आणि तोंडातून पाणी गळत आहे.',
    aiAnalysis: {
      symptoms: ['Sudden massive mortality', 'Cyanotic blue comb', 'Respiratory distress & rales', 'Subcutaneous facial edema'],
      possibleConditions: [
        {
          name: 'Highly Pathogenic Avian Influenza (HPAI / Bird Flu)',
          likelihood: 'Critical Match',
          note: 'Severe cyanosis and acute multi-bird mortality require immediate notification to Animal Husbandry Commissioner.',
        },
        {
          name: 'Velogenic Newcastle Disease (Ranikhet)',
          likelihood: 'High Differential Match',
          note: 'Acute neuro-respiratory manifestation to be ruled out by RT-PCR.',
        },
      ],
      recommendations: [
        'Immediate containment of poultry shed; zero bird movement outside 3km radius.',
        'Collect oropharyngeal and cloacal swabs on viral transport medium under biosafety level 2+ PPE.',
        'Deploy disinfectant misting with sodium hypochlorite around premises.',
      ],
      explanation:
        'Rapid peracute flock mortality with cyanotic combs warrants highest biosafety protocol activation.',
      disclaimer:
        'AI-generated information is provided as decision support and does not replace professional veterinary diagnosis.',
    },
    investigation: {
      findings: 'Petechial hemorrhages found on proventriculus during post-mortem examination. Subcutaneous facial edema verified.',
      clinicalObservations: 'Birds show profound lethargy, torticollis in 4 birds, and greenish watery diarrhea in drop pans.',
      sampleCollected: true,
      sampleType: 'Cloacal & tracheal swabs in Viral Transport Medium (VTM)',
      sampleTubeId: 'TUBE-MH-2026-AVI-0091',
      sampleDate: '2026-08-27T08:00:00Z',
      labReferral: true,
      labName: 'High Security Animal Disease Laboratory (ICAR-NIHSAD), Bhopal via Pune',
      labReferralNumber: 'REF-NIHSAD-2026-0043',
      treatmentTaken: 'Bio-security cordon established. Supportive electrolytes added to water lines; sick flock strictly sequestered.',
      notes: 'District Magistrate informed for potential Section 144 movement restriction on poultry transport in Vasind sector.',
    },
  },

  {
    id: 'CASE-1001',
    farmerName: 'Ramesh Patil',
    contact: '+91 91234 56789',
    village: 'Anjeer Phata',
    taluka: 'Bhiwandi',
    district: 'Thane',
    state: 'Maharashtra',
    species: 'Bovine (Cow / गाय)',
    affectedAnimals: 3,
    deaths: 0,
    duration: '1 to 2 days',
    vaccinationStatus: 'Vaccinated',
    latitude: 19.3002,
    longitude: 73.0597,
    riskScore: 85,
    riskLevel: 'HIGH',
    status: 'UNDER_INVESTIGATION',
    assignedVet: 'Dr. Anand Deshmukh',
    assignedDate: '2026-08-27T14:00:00Z',
    reportedAt: '2026-08-27T10:15:00Z',
    lastUpdatedAt: '2026-08-28T14:30:00Z',
    originalFarmerReport:
      'माझ्या 3 गाईंना कालपासून तीव्र ताप आहे, पायावर फोड आले आहेत आणि तोंडातून खूप लाळ गळत आहे. चारा खात नाहीत आणि चालताना लंगडत आहेत.',
    aiAnalysis: {
      symptoms: ['High Fever (104°F)', 'Foot Blisters', 'Excess Salivation', 'Lameness'],
      possibleConditions: [
        {
          name: 'Foot-and-Mouth Disease (FMD)',
          likelihood: 'High Syndromic Match',
          note: 'Moderate to high risk requiring field examination.',
        },
      ],
      recommendations: [
        'Inspect herd and isolate affected cattle.',
        'Prescribe antiseptic footwash and supportive antipyretics.',
      ],
      explanation: 'Vesicular symptoms match viral aphthovirus cluster in Bhiwandi sub-center.',
      disclaimer: 'AI-generated information is provided as decision support and does not replace professional veterinary diagnosis.',
    },
    investigation: {
      findings: 'Interdigital erythema and small unruptured blisters on right hind hooves. Mild buccal erosions.',
      clinicalObservations: 'Body temp 103.6°F. Hydration stable. No respiratory crackles.',
      sampleCollected: false,
      sampleType: '',
      sampleTubeId: '',
      sampleDate: '',
      labReferral: false,
      labName: '',
      labReferralNumber: '',
      treatmentTaken: 'Povidone-iodine topical foot spray + Meloxicam 15ml IM.',
      notes: 'Follow-up inspection scheduled in 48 hours. Farmer instructed on herd isolation.',
    },
  },
];

const LOCAL_STORAGE_KEY = 'pashuprahari_vet_investigations';

export const vetCaseService = {
  getStoredCases() {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_VET_INVESTIGATION_CASES));
    return [...INITIAL_VET_INVESTIGATION_CASES];
  },

  getCaseById(id) {
    const cases = this.getStoredCases();
    return cases.find((c) => c.id === id) || null;
  },

  saveCaseInvestigation(id, updatedFields) {
    const cases = this.getStoredCases();
    const idx = cases.findIndex((c) => c.id === id);
    if (idx !== -1) {
      cases[idx] = {
        ...cases[idx],
        ...updatedFields,
        lastUpdatedAt: new Date().toISOString(),
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cases));
      return cases[idx];
    }
    return null;
  },
};

export const MOCK_ASSIGNED_VET_CASES = INITIAL_VET_INVESTIGATION_CASES;

export const MOCK_VET_ALERTS = [
  {
    id: 'VALERT-01',
    title: 'Urgent Outbreak Alert: FMD Cluster in Bhiwandi Circle',
    severity: 'CRITICAL',
    location: 'Bhiwandi Taluka (6km radius)',
    timestamp: '25 mins ago',
    detail: 'Cluster of 3 bovine syndromic reports with vesicular lesions. Ring vaccination protocol authorized by District Admin.',
  },
  {
    id: 'VALERT-02',
    title: 'Biological Sample Transit Notice',
    severity: 'HIGH',
    location: 'Shahapur Veterinary Polyclinic',
    timestamp: '2 hours ago',
    detail: 'Avian biological samples for Case #CASE-1005 dispatched to State Disease Diagnostic Laboratory, Pune.',
  },
];

export const getVetDashboardStats = (cases = INITIAL_VET_INVESTIGATION_CASES) => {
  const assignedCases = cases.length;
  const critical = cases.filter((c) => c.riskLevel === 'CRITICAL').length;
  const highRisk = cases.filter((c) => c.riskLevel === 'HIGH').length;
  const underInvestigation = cases.filter((c) => c.status === 'UNDER_INVESTIGATION' || c.status === 'RESPONSE').length;
  const monitoring = cases.filter((c) => c.status === 'MONITORING').length;
  const resolved = cases.filter((c) => c.status === 'RESOLVED').length;

  return {
    assignedCases,
    critical,
    highRisk,
    underInvestigation,
    monitoring,
    resolved,
  };
};
