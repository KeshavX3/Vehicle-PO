@echo off
title Starting VehicleIQ Cockpit...
echo ===================================================
echo   Starting VehicleIQ (Backend API + Frontend Cockpit)
echo ===================================================

echo.
echo [1/3] Launching ASP.NET Core API Backend (http://localhost:5109)...
start "VehicleIQ Backend API" cmd /k "cd /d "%~dp0VehicleIQ.API" && dotnet publish\VehicleIQ.API.dll"

echo.
echo [2/3] Launching React Vite Cockpit UI (http://localhost:5173)...
start "VehicleIQ Cockpit UI" cmd /k "cd /d "%~dp0VehicleIQ.React" && npm run dev"

echo.
echo [3/3] Waiting 3 seconds for servers to initialize...
ping -n 4 127.0.0.1 >nul

echo.
echo Opening VehicleIQ in your default browser...
start http://localhost:5173

echo.
echo ===================================================
echo   VehicleIQ Cockpit is now RUNNING!
echo   Frontend HUD: http://localhost:5173
echo   Backend API:  http://localhost:5109
echo ===================================================
