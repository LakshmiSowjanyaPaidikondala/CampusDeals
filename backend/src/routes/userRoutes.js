const express = require('express');
const { createUser } = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { query, run } = require('../config/db');
const router = express.Router();

// Get individual user (for profile access)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    // Users can only access their own profile, admins can access any profile
    if (userRole !== 'admin' && parseInt(id) !== userId) {
      return res.status(403).json({ message: '❌ Access denied' });
    }

    const [users] = query(
      'SELECT user_id, user_name, user_email, role, user_phone, user_studyyear, user_branch, user_section, user_residency, payment_received, amount_given FROM Users WHERE user_id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: '❌ User not found' });
    }

    res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: '❌ Error fetching user' });
  }
});

// Admin only routes
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [users] = query(
      'SELECT user_id, user_name, user_email, role, user_phone, user_studyyear, user_branch, user_section, user_residency, payment_received, amount_given FROM Users'
    );
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: '❌ Error fetching users' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    // Users can only update their own profile, admins can update any profile
    if (userRole !== 'admin' && parseInt(id) !== userId) {
      return res.status(403).json({ message: '❌ Access denied' });
    }

    const { user_name, user_phone, user_studyyear, user_branch, user_section, user_residency } = req.body;
    
    console.log('Updating user with data:', { user_name, user_phone, user_studyyear, user_branch, user_section, user_residency, id });
    
    const result = run(
      'UPDATE Users SET user_name=?, user_phone=?, user_studyyear=?, user_branch=?, user_section=?, user_residency=? WHERE user_id=?',
      [user_name, user_phone, user_studyyear, user_branch, user_section, user_residency, id]
    );

    console.log('Update result:', result);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: '❌ User not found' });
    }

    res.json({ success: true, message: '✅ User Updated!' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: '❌ Error updating user' });
  }
});

router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = run('DELETE FROM Users WHERE user_id=?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '❌ User not found' });
    }

    res.json({ message: '🗑 User Deleted!' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: '❌ Error deleting user' });
  }
});

module.exports = router;
