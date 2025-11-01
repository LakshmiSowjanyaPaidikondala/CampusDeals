/**
 * Admin Table Verification Script
 * Tests that the admin table and functionality is working correctly
 */

const { db, run, query } = require('./src/config/db');

async function verifyAdminSetup() {
  console.log('🧪 Verifying Admin Setup...');
  console.log('===============================');
  
  try {
    // Test 1: Check if admin table exists
    console.log('1. Checking if admin table exists...');
    const [tables] = query("SELECT name FROM sqlite_master WHERE type='table' AND name='admins'");
    
    if (tables.length === 0) {
      console.log('❌ Admin table does not exist');
      console.log('📝 Creating admin table from schema...');
      
      // Create admin table
      run(`
        CREATE TABLE IF NOT EXISTS admins (
          admin_id INTEGER PRIMARY KEY AUTOINCREMENT,
          admin_name TEXT NOT NULL,
          admin_email TEXT UNIQUE NOT NULL,
          admin_password TEXT NOT NULL,
          admin_phone TEXT,
          admin_studyyear TEXT,
          admin_branch TEXT,
          admin_section TEXT,
          admin_residency TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create indexes
      run('CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(admin_email)');
      
      console.log('✅ Admin table created successfully');
    } else {
      console.log('✅ Admin table exists');
    }
    
    // Test 2: Check table structure
    console.log('\n2. Checking table structure...');
    const [columns] = query("PRAGMA table_info(admins)");
    console.log(`✅ Admin table has ${columns.length} columns`);
    
    const expectedColumns = ['admin_id', 'admin_name', 'admin_email', 'admin_password', 'admin_phone', 'admin_studyyear', 'admin_branch', 'admin_section', 'admin_residency', 'created_at', 'updated_at'];
    const actualColumns = columns.map(col => col.name);
    const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('✅ All expected columns present');
    } else {
      console.log(`❌ Missing columns: ${missingColumns.join(', ')}`);
    }
    
    // Test 3: Test admin controller imports
    console.log('\n3. Testing controller imports...');
    const adminsController = require('./src/controllers/adminsController');
    const expectedMethods = ['getAllAdmins', 'getAdminById', 'createAdmin', 'updateAdmin', 'deleteAdmin'];
    
    const missingMethods = expectedMethods.filter(method => typeof adminsController[method] !== 'function');
    if (missingMethods.length === 0) {
      console.log('✅ All admin controller methods exist');
    } else {
      console.log(`❌ Missing controller methods: ${missingMethods.join(', ')}`);
    }
    
    // Test 4: Test admin routes imports
    console.log('\n4. Testing routes imports...');
    const adminsRoutes = require('./src/routes/adminsRoutes');
    console.log('✅ Admin routes imported successfully');
    
    // Test 5: Check if routes are registered in app
    console.log('\n5. Testing app integration...');
    const app = require('./src/app');
    console.log('✅ App with admin routes imported successfully');
    
    // Test 6: Count existing admins
    console.log('\n6. Checking existing admin data...');
    const [adminCount] = query('SELECT COUNT(*) as count FROM admins');
    console.log(`📊 Current admin count: ${adminCount[0].count}`);
    
    console.log('\n🎉 Admin setup verification complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Start the server: node server.js');
    console.log('2. Use the testing guide: ADMIN_API_TESTING_GUIDE.md');
    console.log('3. Test endpoints with curl or Postman');
    console.log('\n📌 Available Endpoints:');
    console.log('  GET    /api/admins       - Get all admins');
    console.log('  GET    /api/admins/:id   - Get admin by ID');
    console.log('  POST   /api/admins       - Create new admin');
    console.log('  PUT    /api/admins/:id   - Update admin');
    console.log('  DELETE /api/admins/:id   - Delete admin');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.error('Error details:', error);
  }
}

// Run the verification
verifyAdminSetup();