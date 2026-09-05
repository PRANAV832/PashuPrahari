const User = require('../models/User');

// POST /api/users/register
const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      role,
      roleLabel,
      employeeId,
      farmerRefId,
      department,
      designation,
      village,
      district,
      assignedArea,
      status
    } = req.body;

    const cleanedPhone = (phone || '').replace(/\D/g, '');
    if (!cleanedPhone || cleanedPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Valid 10-digit mobile number is required'
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required'
      });
    }

    const existing = await User.findOne({ phone: cleanedPhone });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `User already registered with phone +91 ${cleanedPhone}`
      });
    }

    const newUser = new User({
      name: name.trim(),
      phone: cleanedPhone,
      role: role || 'FARMER',
      roleLabel: roleLabel || (role === 'VETERINARIAN' ? 'Veterinary Officer' : role === 'ADMIN' ? 'Administrator' : 'Livestock Owner'),
      employeeId: employeeId ? employeeId.trim() : null,
      farmerRefId: farmerRefId ? farmerRefId.trim() : null,
      department: department ? department.trim() : 'Department of Animal Husbandry',
      designation: designation ? designation.trim() : 'Field Officer',
      village: village ? village.trim() : '',
      district: district ? district.trim() : 'Thane',
      assignedArea: assignedArea ? assignedArea.trim() : 'Thane District',
      status: status || 'ACTIVE'
    });

    const saved = await newUser.save();
    return res.status(201).json({
      success: true,
      message: `${saved.role} successfully registered in surveillance system`,
      user: saved
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/vets
const getVeterinarians = async (req, res, next) => {
  try {
    const vets = await User.find({
      role: 'VETERINARIAN',
      status: { $ne: 'REVOKED' }
    }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: vets.length,
      veterinarians: vets
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users
const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    let query = {};

    if (role && role !== 'ALL') {
      query.role = role.toUpperCase();
    }
    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { village: new RegExp(search, 'i') },
        { employeeId: new RegExp(search, 'i') },
        { farmerRefId: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id/status
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'PENDING', 'SUSPENDED', 'REVOKED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const user = await User.findByIdAndUpdate(id, { status }, { new: true });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      user
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerUser,
  getVeterinarians,
  getAllUsers,
  updateUserStatus
};
