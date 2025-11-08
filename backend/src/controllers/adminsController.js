const { db, run, query } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/auth');
const { 
  validateEmail, 
  validatePassword, 
  validateRequiredFields, 
  sanitizeUserInput 
} = require('../utils/validation');

// Get all admins
const getAllAdmins = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    let whereClause = '';
    let params = [];
    
    if (search) {
      whereClause = 'WHERE admin_name LIKE ? OR admin_email LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM admins ${whereClause}`;
    const [countResult] = query(countQuery, params);
    const total = countResult[0].total;
    
    // Get paginated results (excluding password)
    const adminQuery = `
      SELECT 
        admin_id, 
        admin_name, 
        admin_email, 
        role,
        admin_phone, 
        admin_studyyear, 
        admin_branch, 
        admin_section, 
        admin_residency,
        created_at,
        updated_at
      FROM admins 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    params.push(parseInt(limit), offset);
    const [admins] = query(adminQuery, params);
    
    res.json({
      success: true,
      message: '✅ Admins retrieved successfully',
      count: admins.length,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      admins: admins
    });

  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ 
      success: false,
      message: '❌ Error fetching admins',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
};

// Get single admin by ID
const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '❌ Invalid admin ID',
        field: 'admin_id'
      });
    }

    const [admins] = query(`
      SELECT 
        admin_id, 
        admin_name, 
        admin_email, 
        role,
        admin_phone, 
        admin_studyyear, 
        admin_branch, 
        admin_section, 
        admin_residency,
        created_at,
        updated_at
      FROM admins 
      WHERE admin_id = ?
    `, [id]);

    if (admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: '❌ Admin not found',
        adminId: id
      });
    }

    res.json({
      success: true,
      message: '✅ Admin retrieved successfully',
      admin: admins[0]
    });

  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({ 
      success: false,
      message: '❌ Error fetching admin',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
};

// Create new admin
const createAdmin = async (req, res) => {
  try {
    // Sanitize input data
    const sanitizedData = sanitizeUserInput(req.body);
    
    const {
      admin_name,
      admin_email,
      admin_password,
      admin_phone,
      admin_studyyear,
      admin_branch,
      admin_section,
      admin_residency
    } = sanitizedData;

    // Validate required fields
    const requiredFields = ['admin_name', 'admin_email', 'admin_password'];
    const fieldValidation = validateRequiredFields(sanitizedData, requiredFields);
    
    if (!fieldValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: '❌ Missing required fields',
        details: fieldValidation.message,
        missingFields: fieldValidation.missingFields
      });
    }

    // Validate email format
    if (!validateEmail(admin_email)) {
      return res.status(400).json({ 
        success: false,
        message: '❌ Please provide a valid email address',
        field: 'admin_email'
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(admin_password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: '❌ Password validation failed',
        details: passwordValidation.message,
        field: 'admin_password'
      });
    }

    // Check if admin already exists
    const [existingAdmins] = query(
      'SELECT admin_id FROM admins WHERE admin_email = ?',
      [admin_email]
    );
    
    if (existingAdmins.length > 0) {
      return res.status(409).json({ 
        success: false,
        message: '❌ Admin with this email already exists',
        suggestion: 'Please use a different email address',
        field: 'admin_email'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(admin_password);

    // Insert new admin
    const [result] = run(
      `INSERT INTO admins 
       (admin_name, admin_email, admin_password, admin_phone, admin_studyyear, admin_branch, admin_section, admin_residency) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        admin_name,
        admin_email,
        hashedPassword,
        admin_phone,
        admin_studyyear,
        admin_branch,
        admin_section,
        admin_residency
      ]
    );

    // Get the created admin (excluding password)
    const [newAdmin] = query(`
      SELECT 
        admin_id, 
        admin_name, 
        admin_email, 
        role,
        admin_phone, 
        admin_studyyear, 
        admin_branch, 
        admin_section, 
        admin_residency,
        created_at,
        updated_at
      FROM admins 
      WHERE admin_id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: '✅ Admin created successfully',
      admin: newAdmin[0]
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ 
      success: false,
      message: '❌ Error creating admin',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
};

// Update admin
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '❌ Invalid admin ID',
        field: 'admin_id'
      });
    }

    // Check if admin exists
    const [existingAdmins] = query(
      'SELECT admin_id FROM admins WHERE admin_id = ?',
      [id]
    );
    
    if (existingAdmins.length === 0) {
      return res.status(404).json({
        success: false,
        message: '❌ Admin not found',
        adminId: id
      });
    }

    // Sanitize input data
    const sanitizedData = sanitizeUserInput(req.body);
    
    const {
      admin_name,
      admin_email,
      admin_phone,
      admin_studyyear,
      admin_branch,
      admin_section,
      admin_residency
    } = sanitizedData;

    // Validate email if provided
    if (admin_email && !validateEmail(admin_email)) {
      return res.status(400).json({ 
        success: false,
        message: '❌ Please provide a valid email address',
        field: 'admin_email'
      });
    }

    // Check if email is already taken by another admin
    if (admin_email) {
      const [emailCheck] = query(
        'SELECT admin_id FROM admins WHERE admin_email = ? AND admin_id != ?',
        [admin_email, id]
      );
      
      if (emailCheck.length > 0) {
        return res.status(409).json({
          success: false,
          message: '❌ Email already taken by another admin',
          field: 'admin_email'
        });
      }
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    
    if (admin_name !== undefined) {
      updateFields.push('admin_name = ?');
      updateValues.push(admin_name);
    }
    if (admin_email !== undefined) {
      updateFields.push('admin_email = ?');
      updateValues.push(admin_email);
    }
    if (admin_phone !== undefined) {
      updateFields.push('admin_phone = ?');
      updateValues.push(admin_phone);
    }
    if (admin_studyyear !== undefined) {
      updateFields.push('admin_studyyear = ?');
      updateValues.push(admin_studyyear);
    }
    if (admin_branch !== undefined) {
      updateFields.push('admin_branch = ?');
      updateValues.push(admin_branch);
    }
    if (admin_section !== undefined) {
      updateFields.push('admin_section = ?');
      updateValues.push(admin_section);
    }
    if (admin_residency !== undefined) {
      updateFields.push('admin_residency = ?');
      updateValues.push(admin_residency);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: '❌ No fields to update',
        suggestion: 'Please provide at least one field to update'
      });
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);
    
    const updateQuery = `UPDATE admins SET ${updateFields.join(', ')} WHERE admin_id = ?`;
    const [result] = run(updateQuery, updateValues);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: '❌ Admin not found or no changes made',
        adminId: id
      });
    }
    
    // Get updated admin
    const [updatedAdmin] = query(`
      SELECT 
        admin_id, 
        admin_name, 
        admin_email, 
        admin_phone, 
        admin_studyyear, 
        admin_branch, 
        admin_section, 
        admin_residency,
        role,
        created_at,
        updated_at
      FROM admins 
      WHERE admin_id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: '✅ Admin updated successfully',
      admin: updatedAdmin[0]
    });

  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ 
      success: false,
      message: '❌ Error updating admin',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
};

// Delete admin
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '❌ Invalid admin ID',
        field: 'admin_id'
      });
    }

    // Check if admin exists and get their info before deletion
    const [existingAdmins] = query(`
      SELECT 
        admin_id, 
        admin_name, 
        admin_email,
        role
      FROM admins 
      WHERE admin_id = ?
    `, [id]);
    
    if (existingAdmins.length === 0) {
      return res.status(404).json({
        success: false,
        message: '❌ Admin not found',
        adminId: id
      });
    }
    
    const adminToDelete = existingAdmins[0];
    
    // Delete admin
    const [result] = run('DELETE FROM admins WHERE admin_id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: '❌ Admin not found',
        adminId: id
      });
    }
    
    res.json({
      success: true,
      message: '✅ Admin deleted successfully',
      deletedAdmin: {
        admin_id: adminToDelete.admin_id,
        admin_name: adminToDelete.admin_name,
        admin_email: adminToDelete.admin_email,
        role: adminToDelete.role
      }
    });

  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ 
      success: false,
      message: '❌ Error deleting admin',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
};

module.exports = {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin
};