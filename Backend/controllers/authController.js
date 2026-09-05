const User = require('../models/User');

const USER_ROLES = {
  ADMIN: 'ADMIN',
  FARMER: 'FARMER',
  VETERINARIAN: 'VETERINARIAN',
};

const ROLE_HOME_ROUTES = {
  [USER_ROLES.ADMIN]: '/admin/dashboard',
  [USER_ROLES.FARMER]: '/farmer/report',
  [USER_ROLES.VETERINARIAN]: '/veterinarian/dashboard',
};

const DEMO_OTP = process.env.DEMO_OTP || '123456';

const INITIAL_SEED_USERS = [
  {
    name: 'District Administrator',
    phone: '9000000000',
    role: USER_ROLES.ADMIN,
    roleLabel: 'Veterinary Department Administration',
    district: 'Thane District Command',
    designation: 'Joint Director of Veterinary Services',
    department: 'Animal Husbandry & Veterinary Services',
    status: 'ACTIVE'
  },
  {
    name: 'District Administrator',
    phone: '9999911111',
    role: USER_ROLES.ADMIN,
    roleLabel: 'Veterinary Department Administration',
    district: 'Thane District Command',
    designation: 'Joint Director of Veterinary Services',
    department: 'Animal Husbandry & Veterinary Services',
    status: 'ACTIVE'
  },
  {
    name: 'Dr. Anand Deshmukh',
    phone: '9876543210',
    role: USER_ROLES.VETERINARIAN,
    roleLabel: 'District Veterinary Officer (DVO)',
    employeeId: 'VET-MH-8801',
    district: 'Thane',
    assignedArea: 'Bhiwandi Central',
    designation: 'District Veterinary Officer (DVO)',
    department: 'Epidemiology Wing',
    status: 'ACTIVE'
  },
  {
    name: 'Dr. Priya Patil',
    phone: '9888822222',
    role: USER_ROLES.VETERINARIAN,
    roleLabel: 'Livestock Development Officer',
    employeeId: 'VET-MH-8802',
    district: 'Thane',
    assignedArea: 'Padgha Sub-Center',
    designation: 'Livestock Development Officer',
    department: 'Livestock Development Department',
    status: 'ACTIVE'
  },
  {
    name: 'Ramesh Patil',
    phone: '9123456789',
    role: USER_ROLES.FARMER,
    roleLabel: 'Registered Livestock Owner / Farmer',
    farmerRefId: 'FMR-MH-2026-1042',
    village: 'Anjeer Phata',
    district: 'Thane',
    assignedArea: 'Bhiwandi Sub-division',
    status: 'ACTIVE'
  }
];

const seedInitialUsers = async () => {
  try {
    for (const u of INITIAL_SEED_USERS) {
      const exists = await User.findOne({ phone: u.phone });
      if (!exists) {
        await User.create(u);
      }
    }
  } catch (err) {
    console.warn('[User Seeder Warning]', err.message);
  }
};

const validatePhoneNumber = (phone) => {
  const cleaned = (phone || '').replace(/\D/g, '');
  if (!cleaned) {
    return { isValid: false, error: 'Mobile number is required' };
  }
  if (cleaned.length !== 10) {
    return { isValid: false, error: 'Please enter a valid 10-digit mobile number' };
  }
  if (!/^[6-9]/.test(cleaned)) {
    return { isValid: false, error: 'Mobile number must start with 6, 7, 8, or 9' };
  }
  return { isValid: true, error: null, cleaned };
};

// POST /api/auth/request-otp
const requestOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const { isValid, error, cleaned } = validatePhoneNumber(phone);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }

    // Verify user exists in database (NO public registration)
    const user = await User.findOne({ phone: cleaned });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Mobile number is not registered with PashuPrahari.'
      });
    }

    if (user.status === 'SUSPENDED' || user.status === 'REVOKED') {
      return res.status(403).json({
        success: false,
        message: `Your account is currently ${user.status.toLowerCase()}. Please contact administration.`
      });
    }

    return res.status(200).json({
      success: true,
      role: user.role,
      message: `OTP sent successfully to +91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`,
      expiresInSeconds: 45,
      isDemoMode: true
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/verify-otp
const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const cleaned = (phone || '').replace(/\D/g, '');
    const cleanOtp = (otp || '').trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit OTP'
      });
    }

    // Isolate demo verification from configuration
    if (cleanOtp !== DEMO_OTP) {
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    const user = await User.findOne({ phone: cleaned });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Mobile number is not registered with PashuPrahari.'
      });
    }

    const userObj = user.toJSON();
    userObj.userId = user._id.toString();
    userObj.redirectPath = ROLE_HOME_ROUTES[user.role] || '/farmer/report';

    const token = `session-${user._id}-${Date.now()}`;

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      user: userObj,
      token
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getCurrentUser = async (req, res, next) => {
  try {
    if (req.user) {
      const userObj = req.user.toJSON();
      userObj.userId = req.user._id.toString();
      userObj.redirectPath = ROLE_HOME_ROUTES[req.user.role] || '/farmer/report';
      return res.status(200).json({
        success: true,
        user: userObj
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Auth service operational'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  requestOtp,
  verifyOtp,
  getCurrentUser,
  seedInitialUsers,
  USER_ROLES,
  ROLE_HOME_ROUTES,
  DEMO_OTP
};
