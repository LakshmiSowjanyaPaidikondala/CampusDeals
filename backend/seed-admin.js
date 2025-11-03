/**
 * Admin Seeding Script
 * Creates initial admin user for the system
 */

const { run, query } = require('./src/config/db');
const { hashPassword } = require('./src/utils/auth');

async function seedInitialAdmin() {
  try {
    console.log('🌱 Seeding Initial Admin...');
    
    // Check if any admins already exist
    const [existingAdmins] = query('SELECT COUNT(*) as count FROM admins');
    
    if (existingAdmins[0].count > 0) {
      console.log('✅ Admin(s) already exist. Skipping seeding.');
      console.log(`📊 Current admin count: ${existingAdmins[0].count}`);
      return;
    }
    
    // Create initial admin
    const adminData = {
      admin_name: 'System Administrator',
      admin_email: 'admin@campusdeals.com',
      admin_password: 'AdminPassword123!', // Change this in production!
      admin_phone: '+1000000000',
      admin_studyyear: 'Staff',
      admin_branch: 'Administration',
      admin_section: 'System',
      admin_residency: 'Campus'
    };
    
    // Hash password
    const hashedPassword = await hashPassword(adminData.admin_password);
    
    // Insert admin
    const result = run(
      `INSERT INTO admins 
       (admin_name, admin_email, admin_password, admin_phone, admin_studyyear, admin_branch, admin_section, admin_residency) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        adminData.admin_name,
        adminData.admin_email,
        hashedPassword,
        adminData.admin_phone,
        adminData.admin_studyyear,
        adminData.admin_branch,
        adminData.admin_section,
        adminData.admin_residency
      ]
    );
    
    console.log('✅ Initial admin created successfully!');
    console.log('📧 Email:', adminData.admin_email);
    console.log('🔑 Password:', adminData.admin_password);
    console.log('⚠️  Please change the default password after first login!');
    
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
  }
}

// Run the seeding
seedInitialAdmin();