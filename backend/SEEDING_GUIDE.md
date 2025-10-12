# 🌱 CampusDeals Seeding System Guide

## Overview
The CampusDeals backend features a comprehensive seeding system that provides sample data for development and testing. The system includes both automatic seeding (when starting the app) and manual seeding tools.

## 🔄 Auto-Seeding (Production Ready)
Auto-seeding happens automatically when you start the application:

```bash
node app.js
```

**What it does:**
- ✅ Checks if data already exists 
- ✅ Only adds missing data (won't duplicate)
- ✅ Seeds users and products automatically
- ✅ Provides consistent development environment
- ✅ Safe for production deployment

**Sample Output:**
```
🌱 AUTO-SEEDING DATABASE...
📊 Current users: 22
ℹ️ Users already exist, skipping user insertion
📊 Current products: 0
📦 Inserting sample products...
✅ Auto-seeding completed successfully
📊 Database Status: 22 users, 17 products, 0 cart items, 0 orders
🚀 Server running on http://localhost:5000
```

## 🛠️ Manual Seeding Tools
For development and testing, use the manual seeding script:

### Available Commands

#### Full Database Seeding
```bash
node seed.js
# or
node seed.js seed
```
Seeds both users and products if they don't exist.

#### Reset Database
```bash
node seed.js reset
```
**⚠️ Warning:** Clears all products, cart items, and orders (keeps users for testing).

#### Products Only
```bash
node seed.js products
```
Seeds only products (useful after reset).

#### Check Status
```bash
node seed.js status
```
Shows current database counts for all tables.

#### Help
```bash
node seed.js help
```
Displays all available commands and examples.

## 📊 Sample Data Included

### Users (22 total)
- **Buy Users:** ravi@example.com, amit@example.com, vikram@example.com, etc.
- **Sell Users:** priya@example.com, sneha@example.com, anita@example.com, etc.
- **Password:** `password123` (for all test users)
- **Branches:** CSE, ECE, ME

### Products (17 total)
- **Drafters:** DFT-001, DFT-002, DFT-003 (Premium, Standard, Budget)
- **White Lab Coats:** WLC-001 to WLC-005 (S, M, L, XL, XXL)
- **Brown Lab Coats:** BLC-001 to BLC-005 (S, M, L, XL, XXL)
- **Calculators:** CALC-001, CALC-002, CALC-003 (MS, ES, ES-Plus)
- **ChartBox:** CHB-001 (Chart Holder)

## 🗂️ File Structure
```
backend/
├── src/seeding/
│   ├── autoSeed.js         # Auto-seeding for app startup
│   ├── seedingUtils.js     # Additional utilities
│   ├── index.js           # Module exports
│   └── legacy-seed.js     # Legacy seeding code
├── seed.js                # Manual seeding script
└── app.js                 # Main app with auto-seeding
```

## 🔧 Development Workflow

### Starting Fresh
```bash
# 1. Reset database
node seed.js reset

# 2. Add fresh sample data
node seed.js

# 3. Check status
node seed.js status

# 4. Start app (will auto-seed if needed)
node app.js
```

### Quick Development Setup
```bash
# Just start the app - auto-seeding handles everything!
node app.js
```

### Testing Specific Features
```bash
# Reset and add only products for testing
node seed.js reset
node seed.js products
```

## 🚀 Production Deployment
The auto-seeding system is production-ready:

- ✅ **Safe:** Won't overwrite existing data
- ✅ **Smart:** Only seeds when needed
- ✅ **Fast:** Quick startup with existing data
- ✅ **Consistent:** Same sample data every time
- ✅ **No Conflicts:** Works with existing user data

## 📝 Notes
- Auto-seeding runs every time you start `node app.js`
- Manual seeding tools are for development only
- All seeding operations use database transactions for safety
- Test credentials are shown after successful seeding
- The system preserves existing user data during resets