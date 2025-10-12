// Seeding Module Index
// Central export for all seeding functionality

const { autoSeedDatabase, manualSeed } = require('./autoSeed');
const { resetDatabase, seedProductsOnly, checkDatabaseStatus, seedSampleCart } = require('./seedingUtils');

module.exports = {
    // Auto-seeding (used by app.js)
    autoSeedDatabase,
    
    // Manual seeding functions
    manualSeed,
    resetDatabase,
    seedProductsOnly,
    seedSampleCart,
    
    // Utility functions
    checkDatabaseStatus
};