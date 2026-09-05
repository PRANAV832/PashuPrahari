const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'phone is required'],
      unique: true,
      trim: true,
      index: true
    },
    role: {
      type: String,
      enum: ['ADMIN', 'VETERINARIAN', 'FARMER'],
      required: [true, 'role is required'],
      default: 'FARMER'
    },
    roleLabel: {
      type: String,
      default: ''
    },
    employeeId: {
      type: String,
      default: null,
      trim: true
    },
    farmerRefId: {
      type: String,
      default: null,
      trim: true
    },
    department: {
      type: String,
      default: 'Department of Animal Husbandry'
    },
    designation: {
      type: String,
      default: 'Field Officer'
    },
    village: {
      type: String,
      default: ''
    },
    district: {
      type: String,
      default: 'Thane'
    },
    assignedArea: {
      type: String,
      default: 'Thane District'
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING', 'SUSPENDED', 'REVOKED'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id ? ret._id.toString() : ret.id;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
