/**
 * Isolated Admin User Registry Store (Farmers & Veterinarians)
 * For System Administrator User Management UI development only.
 */

export const USER_STATUSES = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  SUSPENDED: 'SUSPENDED',
  REVOKED: 'REVOKED',
};

export const STATUS_STYLES = {
  ACTIVE: 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-100',
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
  SUSPENDED: 'bg-orange-50 text-orange-800 border-orange-200',
  REVOKED: 'bg-red-50 text-red-800 border-red-200',
};

const INITIAL_FARMERS = [
  {
    id: 'FMR-MH-2026-1042',
    name: 'Ramesh Narayan Patil',
    mobile: '9123456789',
    village: 'Anjeer Phata',
    district: 'Thane',
    state: 'Maharashtra',
    assignedArea: 'Bhiwandi Sub-division',
    status: 'ACTIVE',
    registeredAt: '2026-08-15T09:30:00Z',
    registeredBy: 'Admin (DVO Thane)',
  },
  {
    id: 'FMR-MH-2026-1043',
    name: 'Sunita Gaikwad',
    mobile: '9988776655',
    village: 'Padgha',
    district: 'Thane',
    state: 'Maharashtra',
    assignedArea: 'Padgha Veterinary Circle',
    status: 'ACTIVE',
    registeredAt: '2026-08-16T11:00:00Z',
    registeredBy: 'Admin (DVO Thane)',
  },
  {
    id: 'FMR-MH-2026-1044',
    name: 'Dattatray Shinde',
    mobile: '9654321987',
    village: 'Kalyan Rural',
    district: 'Thane',
    state: 'Maharashtra',
    assignedArea: 'Kalyan East Block',
    status: 'ACTIVE',
    registeredAt: '2026-08-18T14:20:00Z',
    registeredBy: 'Admin (DVO Thane)',
  },
  {
    id: 'FMR-MH-2026-1045',
    name: 'Meena Kamble',
    mobile: '9811233445',
    village: 'Vasind',
    district: 'Thane',
    state: 'Maharashtra',
    assignedArea: 'Shahapur Poultry Zone',
    status: 'PENDING',
    registeredAt: '2026-08-26T16:45:00Z',
    registeredBy: 'Admin (DVO Thane)',
  },
  {
    id: 'FMR-MH-2026-1046',
    name: 'Ganesh Ware',
    mobile: '9765432198',
    village: 'Murbad',
    district: 'Thane',
    state: 'Maharashtra',
    assignedArea: 'Murbad Hill Track',
    status: 'ACTIVE',
    registeredAt: '2026-08-20T10:10:00Z',
    registeredBy: 'Admin (DVO Thane)',
  },
  {
    id: 'FMR-MH-2026-1047',
    name: 'Kashinath Deshmukh',
    mobile: '9422001122',
    village: 'Kalyan West',
    district: 'Thane',
    state: 'Maharashtra',
    assignedArea: 'Kalyan West Block',
    status: 'SUSPENDED',
    registeredAt: '2026-08-10T12:00:00Z',
    registeredBy: 'Admin (DVO Thane)',
  },
];

const INITIAL_VETS = [
  {
    id: 'VET-MH-8801',
    name: 'Dr. Anand Deshmukh',
    mobile: '9876543210',
    employeeId: 'VET-MH-8801',
    department: 'Department of Animal Husbandry (Epidemiology Wing)',
    designation: 'District Veterinary Officer (DVO)',
    districtArea: 'Bhiwandi Central',
    status: 'ACTIVE',
    registeredAt: '2026-08-01T08:00:00Z',
    registeredBy: 'State Veterinary Directorate',
  },
  {
    id: 'VET-MH-8802',
    name: 'Dr. Priya Patil',
    mobile: '9822011223',
    employeeId: 'VET-MH-8802',
    department: 'Livestock Development Department',
    designation: 'Livestock Development Officer',
    districtArea: 'Padgha Sub-Center',
    status: 'ACTIVE',
    registeredAt: '2026-08-05T09:15:00Z',
    registeredBy: 'Admin (DVO Thane)',
  },
  {
    id: 'VET-MH-8803',
    name: 'Dr. Sunil Shinde',
    mobile: '9833455667',
    employeeId: 'VET-MH-8803',
    department: 'Rural Veterinary Services',
    designation: 'Veterinary Surgeon (Grade I)',
    districtArea: 'Kalyan Rural Unit',
    status: 'ACTIVE',
    registeredAt: '2026-08-08T10:30:00Z',
    registeredBy: 'Admin (DVO Thane)',
  },
  {
    id: 'VET-MH-8804',
    name: 'Dr. Rajesh Jadhav',
    mobile: '9844566778',
    employeeId: 'VET-MH-8804',
    department: 'Veterinary Polyclinic & Hospital',
    designation: 'Senior Veterinary Officer',
    districtArea: 'Shahapur Hospital',
    status: 'ACTIVE',
    registeredAt: '2026-08-12T11:45:00Z',
    registeredBy: 'Admin (DVO Thane)',
  },
  {
    id: 'VET-MH-8805',
    name: 'Dr. Kavita Gokhale',
    mobile: '9855677889',
    employeeId: 'VET-MH-8805',
    department: 'Mobile Veterinary Clinic Unit',
    designation: 'Mobile Veterinary Clinician',
    districtArea: 'Murbad Unit',
    status: 'PENDING',
    registeredAt: '2026-08-25T15:00:00Z',
    registeredBy: 'Admin (DVO Thane)',
  },
];

const STORAGE_KEY_FARMERS = 'pashuprahari_registered_farmers';
const STORAGE_KEY_VETS = 'pashuprahari_registered_vets';

export const adminUserService = {
  getFarmers() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FARMERS);
      return stored ? JSON.parse(stored) : INITIAL_FARMERS;
    } catch {
      return INITIAL_FARMERS;
    }
  },

  getVeterinarians() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VETS);
      return stored ? JSON.parse(stored) : INITIAL_VETS;
    } catch {
      return INITIAL_VETS;
    }
  },

  registerFarmer(farmerData) {
    const current = this.getFarmers();
    const newFarmer = {
      id: farmerData.farmerRefId || `FMR-MH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      name: farmerData.name.trim(),
      mobile: farmerData.mobile.trim(),
      village: farmerData.village.trim(),
      district: farmerData.district.trim() || 'Thane',
      state: farmerData.state.trim() || 'Maharashtra',
      assignedArea: farmerData.assignedArea.trim(),
      status: farmerData.status || USER_STATUSES.ACTIVE,
      registeredAt: new Date().toISOString(),
      registeredBy: 'Veterinary Department Admin',
    };
    const updated = [newFarmer, ...current];
    localStorage.setItem(STORAGE_KEY_FARMERS, JSON.stringify(updated));
    return newFarmer;
  },

  registerVeterinarian(vetData) {
    const current = this.getVeterinarians();
    const newVet = {
      id: vetData.employeeId.trim(),
      name: vetData.name.trim(),
      mobile: vetData.mobile.trim(),
      employeeId: vetData.employeeId.trim(),
      department: vetData.department.trim(),
      designation: vetData.designation.trim(),
      districtArea: vetData.districtArea.trim(),
      status: vetData.status || USER_STATUSES.ACTIVE,
      registeredAt: new Date().toISOString(),
      registeredBy: 'Veterinary Department Admin',
    };
    const updated = [newVet, ...current];
    localStorage.setItem(STORAGE_KEY_VETS, JSON.stringify(updated));
    return newVet;
  },

  updateUser(type, id, updatedFields) {
    if (type === 'FARMER') {
      const list = this.getFarmers().map((f) =>
        f.id === id ? { ...f, ...updatedFields } : f
      );
      localStorage.setItem(STORAGE_KEY_FARMERS, JSON.stringify(list));
      return list;
    } else {
      const list = this.getVeterinarians().map((v) =>
        v.id === id ? { ...v, ...updatedFields } : v
      );
      localStorage.setItem(STORAGE_KEY_VETS, JSON.stringify(list));
      return list;
    }
  },

  updateUserStatus(type, id, newStatus) {
    return this.updateUser(type, id, { status: newStatus });
  },
};
