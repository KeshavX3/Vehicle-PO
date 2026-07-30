# Changelog

All notable changes to the **VehicleIQ** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-30

### 🏎️ Added
- **Automotive Cockpit UI Redesign**: Re-engineered interface featuring a dark night-mode surface (`#0B0B0C`), DM Sans + JetBrains Mono telemetry typography, tactile amber accents (`#F59E0B`), SVG circular gauges ([GaugeRing.tsx](file:///c:/Users/KESHAV-K-INTERN/Desktop/Vehicle%20PO/VehicleIQ.React/src/components/cockpit/GaugeRing.tsx)), and Indian-style registration plates ([RegistrationPlate.tsx](file:///c:/Users/KESHAV-K-INTERN/Desktop/Vehicle%20PO/VehicleIQ.React/src/components/cockpit/RegistrationPlate.tsx)).
- **Refresh Tokens & JWT Rotation**: Database-backed refresh tokens entity, EF migration (`AddRefreshTokensAndFixSeed`), and auth endpoints (`/api/auth/refresh`, `/api/auth/revoke`).
- **Silent 401 Token Refresh Interceptor**: Axios interceptor in `axiosClient.ts` that silently refreshes expired access tokens without interrupting user sessions.
- **xUnit Automated Test Suite**: `VehicleIQ.Tests` project with unit tests covering fleet analytics calculation, health score tier math, and BCrypt authentication.
- **In-Memory Caching**: `IMemoryCache` fleet summary analytics response caching in `AnalyticsService.cs`.
- **Reusable Skeleton Loaders**: `SkeletonLoader.tsx` providing rich animated loading states across Dashboard, Vehicles, and Analytics.
- **1-Command Quick Start**: Added `start.bat`, `start.ps1`, and root `package.json` `npm start` commands.

### 🛡️ Security & Performance
- **EF Core Read Optimization**: Applied `.AsNoTracking()` to read-only queries across repositories.
- **File Upload Security Hardening**: Added MIME-type verification, extension whitelisting (`.pdf`, `.jpg`, `.jpeg`, `.png`, `.doc`, `.docx`), path-traversal prevention, and 10MB file size limits in `DocumentService.cs`.
- **Soft Delete Safeguards**: EF Core global query filters (`IsDeleted`) to protect historical fleet audit data.
- **CI/CD Integration**: GitHub Actions CI workflow executing `dotnet test` and `npm run build`.

---

<div align="center">
  <sub>VehicleIQ Version 1.0.0 — Production Ready Open-Source Release</sub>
</div>
