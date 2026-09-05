const express = require('express');
const router = express.Router();
const {
  registerUser,
  getVeterinarians,
  getAllUsers,
  updateUserStatus
} = require('../controllers/userController');

// POST /api/users/register - Register a user (Admin only in production)
router.post('/register', registerUser);

// GET /api/users/vets - Retrieve all registered veterinarians for assignment
router.get('/vets', getVeterinarians);

// GET /api/users - Retrieve all users with filters
router.get('/', getAllUsers);

// PATCH /api/users/:id/status - Update user account status
router.patch('/:id/status', updateUserStatus);

module.exports = router;
