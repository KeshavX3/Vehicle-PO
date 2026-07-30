# Contributing to VehicleIQ

Thank you for your interest in contributing to **VehicleIQ**! We welcome bug reports, feature suggestions, documentation enhancements, and pull requests from the community.

---

## 🚀 Code of Conduct

Please maintain a respectful, professional, and welcoming environment for all contributors.

---

## 🛠️ Development Setup

### Prerequisites
- **Node.js** v20+ & **npm**
- **.NET 10 SDK** (or .NET 8+)
- **SQL Server LocalDB** or SQL Server 2022 / Docker

### Quick Start

```cmd
# Start both Backend & Frontend in 1 command
.\start.bat
```

Or run services manually:

```bash
# Terminal 1: Backend API (Port 5109)
cd VehicleIQ.API
dotnet ef database update
dotnet run

# Terminal 2: Frontend UI (Port 5173)
cd VehicleIQ.React
npm install
npm run dev
```

---

## 🧪 Testing Guidelines

Before submitting a Pull Request, ensure that all automated unit tests pass and the frontend builds cleanly without TypeScript errors:

```bash
# Run backend test suite
dotnet test

# Verify frontend production build
cd VehicleIQ.React
npm run build
```

---

## 📦 Pull Request Process

1. **Fork the Repository**: Create your feature branch (`git checkout -b feature/amazing-feature`).
2. **Commit Changes**: Follow conventional commits (`git commit -m 'feat: add telemetry export feature'`).
3. **Verify Build & Tests**: Run `dotnet test` and `npm run build`.
4. **Push & Submit PR**: Open a Pull Request against `main`.

---

## 🔒 Security Vulnerabilities

If you discover a potential security issue in VehicleIQ, please do not open a public GitHub issue. Send a report to `security@vehicleiq.dev` for responsible disclosure.
