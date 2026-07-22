<div align="center">

# 🚗 VehicleIQ
### *Smart Vehicle Health, Expense & Predictive Intelligence Platform*

[![Build Status](https://img.shields.io/badge/Build-Passing-10b981?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![.NET](https://img.shields.io/badge/.NET_Core-10.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![SQL Server](https://img.shields.io/badge/SQL_Server-2022-CC292B?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)](https://www.microsoft.com/sql-server)
[![JWT](https://img.shields.io/badge/Auth-JWT_Bearer-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

<p align="center">
  <a href="#-key-features">Key Features</a> •
  <a href="#-system-architecture">Architecture</a> •
  <a href="#-ai--analytics-intelligence">AI Insights</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-database-schema">Database</a>
</p>

---

</div>

## 🌌 Overview

**VehicleIQ** is an enterprise-grade, full-stack vehicle fleet management & analytics SaaS platform. Designed with a **futuristic dark glassmorphism UI**, it empowers users to monitor vehicle health, track fuel consumption, forecast maintenance costs, store documents securely, and receive **predictive AI alerts** for servicing and efficiency drops.

---

## ✨ Key Features

| Module | Feature Capabilities |
| :--- | :--- |
| 🔑 **JWT Authentication** | Secure registration, BCrypt password hashing, 7-day signed JWT tokens, and automatic session persistence. |
| 📊 **Interactive Dashboard** | Live KPI counters, 6-month spending trends, expense category pie chart, and upcoming due reminders. |
| 🚘 **Vehicle Garage** | Card grid with gradient headers, full vehicle specifications, current odometer, and tabbed detail views. |
| ⛽ **Fuel Log & Mileage** | Instant fuel logging with auto-calculated rolling mileage ($km/L$) and station tracking. |
| 🔧 **Service History** | Garage tracking, maintenance logs, itemized costs, and next service interval targets. |
| 💸 **Expense Tracker** | Categorized spending, monthly expenditure bar charts, and category filter pills. |
| 🧠 **AI Fleet Analytics** | Fuel efficiency anomaly detection ($>15\%$ drop alerts), predictive service due calendar, and cost-per-km ($CPK$) benchmarks. |
| 🛡️ **Insurance & PUC** | Active policy status badges, expiration warnings, and renewal tracking. |
| 📁 **Document Library** | Multi-file document storage for RC books, insurance policies, and test certificates. |

---

## 🏗️ System Architecture

```mermaid
graph TD
    User([User Browser]) <-->|HTTP/HTTPS| ReactApp[React 18 + TypeScript + Vite]
    
    subgraph Frontend Layer [React 18 Frontend - Port 5173]
        ReactApp -->|Context| AuthState[AuthContext & JWT Store]
        ReactApp -->|Axios Interceptor| AxiosClient[Central Axios Client]
        ReactApp -->|UI Styling| GlassUI[Tailwind CSS Glassmorphism]
        ReactApp -->|Visualizations| Charts[Recharts Area / Bar / Pie]
    end

    AxiosClient <-->|REST API + Bearer JWT| API[ASP.NET Core Web API - Port 5109]

    subgraph Backend Layer [ASP.NET Core Web API Layer]
        API --> Controllers[Controllers Layer]
        Controllers --> Middleware[Global Exception Middleware]
        Controllers --> Services[Business Services Layer]
        Services --> JwtService[JwtService & BCrypt Auth]
        Services --> AnalyticsService[AI Analytics & Anomaly Engine]
        Services --> Repositories[Generic & Entity Repositories]
    end

    Repositories <-->|Entity Framework Core 10| SQL[(SQL Server LocalDB)]
```

---

## 🧠 AI & Analytics Intelligence

VehicleIQ features built-in algorithmic intelligence:

### 1. ⛽ Fuel Efficiency Anomaly Engine
Calculates rolling baseline mileage ($km/L$). If a new fuel log drops **$>15\%$ below baseline**, the system flags an anomaly card warning you to inspect tire pressure, air filters, or engine tuning.

### 2. 🔮 Predictive Service Due Calculator
Determines your average daily driving velocity ($km/day$) and predicts the exact calendar date when your vehicle will reach its next maintenance threshold.

### 3. 💰 Cost Per Kilometer ($CPK$) & Spend Forecasting
Calculates true ownership cost per km ($Total Spent / Total Distance$) and projects 30-day and 90-day fleet maintenance budgets using exponential smoothing run-rates.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v20+ & **npm**
- **.NET 8/10 SDK**
- **SQL Server LocalDB** or SQL Server 2022

### 1. Clone & Set Up Backend

```bash
cd VehicleIQ.API

# Update database schema
dotnet ef database update

# Run the API server
dotnet run --launch-profile http
# API runs at http://localhost:5109
# Swagger UI available at http://localhost:5109/swagger
```

### 2. Set Up Frontend

```bash
cd VehicleIQ.React

# Install dependencies
npm install

# Run the development server
npm run dev
# Frontend runs at http://localhost:5173
```

---

## 🗄️ Database Schema

The database consists of **9 normalized relational entities** configured with EF Core Fluent API, soft-delete global query filters, and audit columns (`CreatedAt`, `UpdatedAt`):

- `Users` — Account records and hashed credentials.
- `Vehicles` — Fleet vehicles and current odometers.
- `FuelEntries` — Fuel logs and auto mileage calculations.
- `ServiceRecords` — Maintenance events and target odometers.
- `Expenses` — All categorized vehicle spending.
- `Insurances` — Coverage types and expiry dates.
- `PucCertificates` — Emission test certificates.
- `Reminders` — Kanban-style task notifications.
- `Documents` — File upload references.

---

<div align="center">

Made with ❤️ using **React**, **ASP.NET Core**, and **SQL Server**.

</div>
