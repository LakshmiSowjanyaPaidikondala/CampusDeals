#!/usr/bin/env node
// Manual Seeding Script
// Run this script directly for development seeding: node seed.js

const { manualSeed, resetDatabase, checkDatabaseStatus, seedProductsOnly } = require('./src/seeding');

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'seed';

console.log('🛠️ CAMPUSDEALS SEEDING TOOL');
console.log('===========================');

switch (command.toLowerCase()) {
    case 'seed':
    case 'auto':
        console.log('📋 Running full database seeding...');
        manualSeed();
        break;
        
    case 'reset':
        console.log('🔄 Resetting database...');
        resetDatabase();
        console.log('💡 Run "node seed.js" to add sample data');
        break;
        
    case 'products':
        console.log('📦 Seeding products only...');
        seedProductsOnly();
        break;
        
    case 'status':
    case 'check':
        console.log('📊 Checking database status...');
        checkDatabaseStatus();
        break;
        
    case 'help':
    case '--help':
    case '-h':
        console.log('🔧 AVAILABLE COMMANDS:');
        console.log('  seed       - Full database seeding (default)');
        console.log('  reset      - Clear all data (keep users)');
        console.log('  products   - Seed products only');
        console.log('  status     - Check database status');
        console.log('  help       - Show this help message');
        console.log('');
        console.log('📝 EXAMPLES:');
        console.log('  node seed.js           # Full seeding');
        console.log('  node seed.js reset     # Reset database');
        console.log('  node seed.js products  # Products only');
        console.log('  node seed.js status    # Check status');
        break;
        
    default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('💡 Use "node seed.js help" for available commands');
        process.exit(1);
}

console.log('✅ Seeding operation completed!');