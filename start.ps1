# PowerShell startup script for VehicleIQ
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Starting VehicleIQ (Backend API + Frontend Cockpit)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "`n[1/3] Launching ASP.NET Core API Backend (http://localhost:5109)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k cd /d `"$scriptPath\VehicleIQ.API`" && dotnet bin\Debug\net10.0\VehicleIQ.API.dll" -WindowStyle Normal

Write-Host "[2/3] Launching React Vite Cockpit UI (http://localhost:5173)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k cd /d `"$scriptPath\VehicleIQ.React`" && npm run dev" -WindowStyle Normal

Write-Host "[3/3] Waiting 3 seconds for servers to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "`nOpening VehicleIQ in your default browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "  VehicleIQ Cockpit is now RUNNING!" -ForegroundColor Green
Write-Host "  Frontend HUD: http://localhost:5173" -ForegroundColor Green
Write-Host "  Backend API:  http://localhost:5109" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
