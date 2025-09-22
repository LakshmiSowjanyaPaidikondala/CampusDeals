# setup-database.ps1
# PowerShell script to setup Better-SQLite3 database

Write-Host "🚀 CampusDeals Database Setup" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

# Check if we're in the backend directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the backend directory" -ForegroundColor Red
    Write-Host "   cd c:\CampusDeals\backend" -ForegroundColor Yellow
    exit 1
}

# Check if better-sqlite3 is installed
Write-Host "🔍 Checking better-sqlite3 installation..." -ForegroundColor Blue
try {
    $result = npm list better-sqlite3 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ better-sqlite3 is installed" -ForegroundColor Green
    } else {
        Write-Host "❌ better-sqlite3 not found. Installing..." -ForegroundColor Red
        npm install better-sqlite3
    }
} catch {
    Write-Host "❌ Error checking better-sqlite3 installation" -ForegroundColor Red
    exit 1
}

# Run the setup script
Write-Host "`n🗃️  Setting up database..." -ForegroundColor Blue
try {
    node setup-better-sqlite3.js
    Write-Host "`n✅ Database setup completed!" -ForegroundColor Green
    Write-Host "📁 Database location: backend\database\campusdeals.db" -ForegroundColor Cyan
    Write-Host "`n🚀 You can now start the server with:" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor White
} catch {
    Write-Host "❌ Database setup failed!" -ForegroundColor Red
    exit 1
}