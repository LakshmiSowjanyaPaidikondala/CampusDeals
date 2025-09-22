# stop-and-reset.ps1
# PowerShell script to stop processes and reset database

Write-Host "🛑 Stopping Node.js processes..." -ForegroundColor Yellow

# Kill any running node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "✅ Node processes stopped" -ForegroundColor Green

# Wait a moment
Start-Sleep -Seconds 2

Write-Host "`n🔄 Resetting database..." -ForegroundColor Blue

# Try the quick reset first
try {
    node quick-reset.js
    Write-Host "✅ Database reset successful!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Quick reset failed, trying full setup..." -ForegroundColor Yellow
    
    # Try the full setup
    try {
        node setup-better-sqlite3.js
        Write-Host "✅ Full setup successful!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Setup failed. Manual intervention needed." -ForegroundColor Red
        Write-Host "`nManual steps:" -ForegroundColor Yellow
        Write-Host "1. Close VS Code and any database viewers" -ForegroundColor White
        Write-Host "2. Delete the database file manually:" -ForegroundColor White
        Write-Host "   Remove-Item 'database\campusdeals.db' -Force" -ForegroundColor Cyan
        Write-Host "3. Run: node setup-better-sqlite3.js" -ForegroundColor White
    }
}