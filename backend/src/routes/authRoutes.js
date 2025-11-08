const express = require('express');
const { signup, login, logout, refreshAccessToken, getProfile, validateUserForTransaction, register, adminLogin, adminRegister } = require('../controllers/authController');
const { authenticateToken, conditionalAuthorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Public routes for authentication
router.post('/signup', signup);
router.post('/register', register); // Backward compatibility
router.post('/login', login);
router.post('/admin-login', adminLogin); // Dedicated admin login endpoint
// Admin registration: allow unauthenticated creation only when no admins exist.
// Otherwise require a valid access token and the 'admin' role.
router.post('/admin-register', conditionalAuthorizeRoles('admin'), adminRegister); // Dedicated admin registration endpoint
router.post('/refresh', refreshAccessToken); // Refresh token endpoint

// Protected routes
router.post('/logout', authenticateToken, logout);
router.get('/profile', authenticateToken, getProfile);
router.post('/validate-transaction', authenticateToken, validateUserForTransaction);

module.exports = router;
