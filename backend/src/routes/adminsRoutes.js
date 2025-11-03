const express = require('express');
const {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin
} = require('../controllers/adminsController');

const { authenticateToken, authorizeRoles, conditionalAuth, authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Special bootstrap endpoint - uses conditional auth (no auth if no admin exists)
router.post('/bootstrap', conditionalAuth, createAdmin);

// Apply admin-only authentication to all other admin routes
router.use(authenticateAdmin);

// GET /api/admins - Get all admins with optional pagination and search
router.get('/', getAllAdmins);

// GET /api/admins/:id - Get admin by ID
router.get('/:id', getAdminById);

// POST /api/admins - Create new admin
router.post('/', createAdmin);

// PUT /api/admins/:id - Update admin
router.put('/:id', updateAdmin);

// DELETE /api/admins/:id - Delete admin
router.delete('/:id', deleteAdmin);

module.exports = router;