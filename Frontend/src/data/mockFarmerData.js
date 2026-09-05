/**
 * Isolated Farmer Mock Data
 * Provides personalized livestock health reports, detailed case tracking, and timeline steps.
 */

export const LIFECYCLE_STEPS = [
  { key: 'SUBMITTED', label: 'Complaint Submitted', description: 'Voice/text complaint logged by farmer' },
  { key: 'AI_ASSESSMENT', label: 'AI Assessment', description: 'Automated syndromic symptom extraction' },
  { key: 'DEPT_REVIEW', label: 'Veterinary Department Review', description: 'Triage verification by District Surveillance Unit' },
  { key: 'VET_ASSIGNED', label: 'Veterinarian Assigned', description: 'Field veterinary surgeon assigned for inspection' },
  { key: 'UNDER_INVESTIGATION', label: 'Under Investigation', description: 'Physical herd check & sample examination' },
  { key: 'MONITORING', label: 'Monitoring', description: 'Follow-up observation & recovery surveillance' },
  { key: 'RESOLVED', label: 'Resolved', description: 'Treatment completed and case closed' },
];

export const MOCK_FARMER_CASES_BY_USER = {
  // Default Demo Farmer: Ramesh Patil (Phone: 9123456789)
  'Ramesh Patil': [
    {
      id: 'CASE-1001',
      farmerName: 'Ramesh Patil',
      mobile: '9123456789',
      village: 'Anjeer Phata',
      taluka: 'Bhiwandi',
      district: 'Thane',
      state: 'Maharashtra',
      species: 'Cattle / Cow (गाय)',
      affectedAnimals: 3,
      deaths: 0,
      duration: '1 to 2 days (1-2 दिवस)',
      vaccinationStatus: 'Vaccinated (लसीकरण झालेले)',
      rawComplaint: 'माझ्या 3 गाईंना कालपासून तीव्र ताप आहे, पायावर फोड आले आहेत आणि तोंडातून खूप लाळ गळत आहे. चारा खात नाहीत आणि चालताना लंगडत आहेत.',
      symptoms: ['High Fever (तीव्र ताप)', 'Foot Blisters (पायावर फोड)', 'Excess Salivation (लाळ गळणे)', 'Lameness (लंगडणे)'],
      riskScore: 85,
      riskLevel: 'HIGH',
      status: 'UNDER_INVESTIGATION',
      statusLabel: 'Under Investigation',
      assignedVet: 'Dr. Anand Deshmukh (Bhiwandi Central Dispensary)',
      reportedAt: '2026-08-27T10:15:00Z',
      lastUpdatedAt: '2026-08-28T14:30:00Z',
      latestUpdate: 'Dr. Anand Deshmukh scheduled for physical herd inspection today at 3:00 PM.',
      timeline: [
        {
          step: 'Complaint Submitted',
          date: '27 Aug 2026, 10:15 AM',
          status: 'COMPLETED',
          detail: 'Voice complaint successfully recorded via Marathi speech recognition.',
        },
        {
          step: 'AI Assessment',
          date: '27 Aug 2026, 10:16 AM',
          status: 'COMPLETED',
          detail: 'Symptoms classified with High Syndromic Match for Foot-and-Mouth Disease (FMD).',
        },
        {
          step: 'Veterinary Department Review',
          date: '27 Aug 2026, 11:30 AM',
          status: 'COMPLETED',
          detail: 'Triage officer validated incident in Thane District Command Queue.',
        },
        {
          step: 'Veterinarian Assigned',
          date: '27 Aug 2026, 02:00 PM',
          status: 'COMPLETED',
          detail: 'Assigned to Dr. Anand Deshmukh (Bhiwandi Central Dispensary).',
        },
        {
          step: 'Under Investigation',
          date: '28 Aug 2026, 02:30 PM',
          status: 'CURRENT',
          detail: 'Field officer dispatched for physical examination and ring-quarantine check.',
        },
        {
          step: 'Monitoring',
          date: 'Pending',
          status: 'UPCOMING',
          detail: 'Twice-daily temperature log and herd recovery monitoring.',
        },
        {
          step: 'Resolved',
          date: 'Pending',
          status: 'UPCOMING',
          detail: 'Final clinical clearance and closure by attending veterinarian.',
        },
      ],
    },
    {
      id: 'CASE-1008',
      farmerName: 'Ramesh Patil',
      mobile: '9123456789',
      village: 'Anjeer Phata',
      taluka: 'Bhiwandi',
      district: 'Thane',
      state: 'Maharashtra',
      species: 'Buffalo (म्हैस)',
      affectedAnimals: 1,
      deaths: 0,
      duration: '3 to 5 days (3-5 दिवस)',
      vaccinationStatus: 'Vaccinated (लसीकरण झालेले)',
      rawComplaint: 'म्हैशीला खोकला येत होता आणि रोजचे दूध कमी झाले होते.',
      symptoms: ['Mild Coughing (खोकला)', 'Reduced Milk Yield (दूध कमी)'],
      riskScore: 35,
      riskLevel: 'LOW',
      status: 'RESOLVED',
      statusLabel: 'Resolved',
      assignedVet: 'Dr. Priya Patil (Padgha Sub-Center)',
      reportedAt: '2026-08-14T08:30:00Z',
      lastUpdatedAt: '2026-08-19T16:00:00Z',
      latestUpdate: 'Treatment completed with mineral supplements. Milk production returned to normal.',
      timeline: [
        {
          step: 'Complaint Submitted',
          date: '14 Aug 2026, 08:30 AM',
          status: 'COMPLETED',
          detail: 'Report logged via mobile portal.',
        },
        {
          step: 'AI Assessment',
          date: '14 Aug 2026, 08:31 AM',
          status: 'COMPLETED',
          detail: 'Classified as mild non-contagious metabolic/respiratory symptom.',
        },
        {
          step: 'Veterinary Department Review',
          date: '14 Aug 2026, 10:00 AM',
          status: 'COMPLETED',
          detail: 'Low-risk priority assigned.',
        },
        {
          step: 'Veterinarian Assigned',
          date: '14 Aug 2026, 11:30 AM',
          status: 'COMPLETED',
          detail: 'Dr. Priya Patil assigned for follow-up.',
        },
        {
          step: 'Under Investigation',
          date: '15 Aug 2026, 10:00 AM',
          status: 'COMPLETED',
          detail: 'Examined buffalo; prescribed oral vitamins and feed additives.',
        },
        {
          step: 'Monitoring',
          date: '17 Aug 2026, 04:00 PM',
          status: 'COMPLETED',
          detail: 'Farmer confirmed milk yield improved.',
        },
        {
          step: 'Resolved',
          date: '19 Aug 2026, 04:00 PM',
          status: 'COMPLETED',
          detail: 'Case successfully resolved and closed.',
        },
      ],
    },
    {
      id: 'CASE-1012',
      farmerName: 'Ramesh Patil',
      mobile: '9123456789',
      village: 'Anjeer Phata',
      taluka: 'Bhiwandi',
      district: 'Thane',
      state: 'Maharashtra',
      species: 'Goat (बकरी)',
      affectedAnimals: 2,
      deaths: 0,
      duration: 'Less than 24 hours (24 तासांपेक्षा कमी)',
      vaccinationStatus: 'Not Vaccinated (लसीकरण नाही)',
      rawComplaint: 'दोन बकऱ्यांच्या अंगावर बारीक पुरळ आले आहे आणि त्या चारा खात नाहीत.',
      symptoms: ['Skin Lesions (त्वचेवर पुरळ)', 'Lethargy (सुस्ती)'],
      riskScore: 60,
      riskLevel: 'MODERATE',
      status: 'REPORTED',
      statusLabel: 'Reported',
      assignedVet: null,
      reportedAt: '2026-08-29T07:45:00Z',
      lastUpdatedAt: '2026-08-29T07:46:00Z',
      latestUpdate: 'Case logged into District Queue. Awaiting veterinary officer allocation.',
      timeline: [
        {
          step: 'Complaint Submitted',
          date: '29 Aug 2026, 07:45 AM',
          status: 'COMPLETED',
          detail: 'Complaint submitted by farmer.',
        },
        {
          step: 'AI Assessment',
          date: '29 Aug 2026, 07:46 AM',
          status: 'COMPLETED',
          detail: 'Moderate risk identified for ectoparasitic / syndromic skin condition.',
        },
        {
          step: 'Veterinary Department Review',
          date: '29 Aug 2026, 08:00 AM',
          status: 'CURRENT',
          detail: 'Case listed in Administrative Triage Queue for vet dispatch.',
        },
        {
          step: 'Veterinarian Assigned',
          date: 'Pending',
          status: 'UPCOMING',
          detail: 'Officer will be allocated based on taluka jurisdiction.',
        },
        {
          step: 'Under Investigation',
          date: 'Pending',
          status: 'UPCOMING',
          detail: 'Physical check at shed.',
        },
        {
          step: 'Monitoring',
          date: 'Pending',
          status: 'UPCOMING',
          detail: 'Recovery monitoring.',
        },
        {
          step: 'Resolved',
          date: 'Pending',
          status: 'UPCOMING',
          detail: 'Case closure.',
        },
      ],
    },
  ],

  // Demo Registered Farmer: Sunita Gaikwad (Phone: 9988776655)
  'Sunita Gaikwad': [
    {
      id: 'CASE-1002',
      farmerName: 'Sunita Gaikwad',
      mobile: '9988776655',
      village: 'Padgha',
      taluka: 'Bhiwandi',
      district: 'Thane',
      state: 'Maharashtra',
      species: 'Bovine (Buffalo)',
      affectedAnimals: 12,
      deaths: 3,
      duration: '3 to 5 days',
      vaccinationStatus: 'Partially Vaccinated',
      rawComplaint: 'म्हैशींना तीव्र ताप, तोंडात आणि जिभेवर मोठे फोड, आणि लंगडणे सुरू आहे. 3 म्हशींचा मृत्यू झाला आहे.',
      symptoms: ['High Fever', 'Mouth Lesions', 'Lameness', 'Loss of Appetite'],
      riskScore: 94,
      riskLevel: 'CRITICAL',
      status: 'UNDER_INVESTIGATION',
      statusLabel: 'Under Investigation',
      assignedVet: 'Dr. Priya Patil (Padgha Sub-Center)',
      reportedAt: '2026-08-27T11:00:00Z',
      lastUpdatedAt: '2026-08-28T09:15:00Z',
      latestUpdate: 'Quarantine protocol issued for shed. Antiviral supportive treatment dispatched.',
      timeline: [
        {
          step: 'Complaint Submitted',
          date: '27 Aug 2026, 11:00 AM',
          status: 'COMPLETED',
          detail: 'Urgent voice complaint recorded.',
        },
        {
          step: 'AI Assessment',
          date: '27 Aug 2026, 11:01 AM',
          status: 'COMPLETED',
          detail: 'Critical outbreak risk flagged with high mortality cluster.',
        },
        {
          step: 'Veterinary Department Review',
          date: '27 Aug 2026, 11:15 AM',
          status: 'COMPLETED',
          detail: 'Priority escalation to District Veterinary Officer.',
        },
        {
          step: 'Veterinarian Assigned',
          date: '27 Aug 2026, 11:30 AM',
          status: 'COMPLETED',
          detail: 'Dr. Priya Patil dispatched with emergency medical kit.',
        },
        {
          step: 'Under Investigation',
          date: '27 Aug 2026, 01:00 PM',
          status: 'CURRENT',
          detail: 'Samples collected for Pune State Diagnostic Lab. Shed isolated.',
        },
        {
          step: 'Monitoring',
          date: 'Pending',
          status: 'UPCOMING',
          detail: '10km geofence SMS alert active.',
        },
        {
          step: 'Resolved',
          date: 'Pending',
          status: 'UPCOMING',
          detail: 'Pending lab results and herd recovery.',
        },
      ],
    },
    {
      id: 'CASE-1007',
      farmerName: 'Sunita Gaikwad',
      mobile: '9988776655',
      village: 'Padgha',
      taluka: 'Bhiwandi',
      district: 'Thane',
      state: 'Maharashtra',
      species: 'Goat (बकरी)',
      affectedAnimals: 2,
      deaths: 0,
      duration: '1 to 2 days',
      vaccinationStatus: 'Vaccinated',
      rawComplaint: 'बकऱ्या चारा व्यवस्थित खात नव्हत्या.',
      symptoms: ['Loss of appetite'],
      riskScore: 25,
      riskLevel: 'LOW',
      status: 'RESOLVED',
      statusLabel: 'Resolved',
      assignedVet: 'Dr. Sunil Shinde',
      reportedAt: '2026-08-10T09:00:00Z',
      lastUpdatedAt: '2026-08-14T11:00:00Z',
      latestUpdate: 'Deworming medication administered. Animal recovered.',
      timeline: [
        {
          step: 'Complaint Submitted',
          date: '10 Aug 2026, 09:00 AM',
          status: 'COMPLETED',
          detail: 'Report created.',
        },
        {
          step: 'AI Assessment',
          date: '10 Aug 2026, 09:01 AM',
          status: 'COMPLETED',
          detail: 'Low syndromic risk.',
        },
        {
          step: 'Veterinary Department Review',
          date: '10 Aug 2026, 10:00 AM',
          status: 'COMPLETED',
          detail: 'Standard review.',
        },
        {
          step: 'Veterinarian Assigned',
          date: '10 Aug 2026, 11:00 AM',
          status: 'COMPLETED',
          detail: 'Assigned to Dr. Sunil Shinde.',
        },
        {
          step: 'Under Investigation',
          date: '11 Aug 2026, 02:00 PM',
          status: 'COMPLETED',
          detail: 'Physical inspection completed.',
        },
        {
          step: 'Monitoring',
          date: '13 Aug 2026, 10:00 AM',
          status: 'COMPLETED',
          detail: 'Goats feeding normally.',
        },
        {
          step: 'Resolved',
          date: '14 Aug 2026, 11:00 AM',
          status: 'COMPLETED',
          detail: 'Case closed.',
        },
      ],
    },
  ],
};

export const MOCK_FARMER_NOTIFICATIONS = [
  {
    id: 'NOTIF-01',
    title: 'Veterinarian Assigned to Your Case #CASE-1001',
    message: 'Dr. Anand Deshmukh from Bhiwandi Central Unit has been assigned to inspect your cows.',
    timestamp: '2 hours ago',
    type: 'VET_ASSIGNED',
    isNew: true,
  },
  {
    id: 'NOTIF-02',
    title: 'Regional Advisory: Foot-and-Mouth Disease (FMD)',
    message: 'Precautionary advisory issued for Bhiwandi taluka. Maintain antiseptic footbaths at shed entrance.',
    timestamp: '1 day ago',
    type: 'ADVISORY',
    isNew: false,
  },
  {
    id: 'NOTIF-03',
    title: 'Free Preventive Vaccination Camp',
    message: 'Department of Animal Husbandry camp scheduled at Padgha Primary School ground on Sept 2.',
    timestamp: '2 days ago',
    type: 'CAMP',
    isNew: false,
  },
];

export const getFarmerDashboardData = (farmerName) => {
  const cases =
    MOCK_FARMER_CASES_BY_USER[farmerName] ||
    MOCK_FARMER_CASES_BY_USER['Ramesh Patil'];

  const totalReports = cases.length;
  const activeCases = cases.filter((c) => c.status !== 'RESOLVED').length;
  const underInvestigation = cases.filter((c) => c.status === 'UNDER_INVESTIGATION').length;
  const resolved = cases.filter((c) => c.status === 'RESOLVED').length;

  return {
    cases,
    stats: {
      totalReports,
      activeCases,
      underInvestigation,
      resolved,
    },
    notifications: MOCK_FARMER_NOTIFICATIONS,
  };
};

export const getFarmerCaseById = (farmerName, caseId) => {
  const cases =
    MOCK_FARMER_CASES_BY_USER[farmerName] ||
    MOCK_FARMER_CASES_BY_USER['Ramesh Patil'];

  return cases.find((c) => c.id === caseId) || null;
};
