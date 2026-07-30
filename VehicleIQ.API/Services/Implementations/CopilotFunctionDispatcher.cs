using System.Text.Json;
using VehicleIQ.API.DTOs.Copilot;
using VehicleIQ.API.Services.Interfaces;

namespace VehicleIQ.API.Services.Implementations;

/// <summary>
/// Dispatches AI function calls to existing VehicleIQ services.
/// Maps function names from Gemini to real backend data queries.
/// The LLM never generates SQL — it only receives structured JSON results.
/// </summary>
public class CopilotFunctionDispatcher
{
    private readonly IVehicleService _vehicleService;
    private readonly IFuelEntryService _fuelEntryService;
    private readonly IServiceRecordService _serviceRecordService;
    private readonly IExpenseService _expenseService;
    private readonly IInsuranceService _insuranceService;
    private readonly IPucCertificateService _pucService;
    private readonly IReminderService _reminderService;
    private readonly IDocumentService _documentService;
    private readonly IAnalyticsService _analyticsService;
    private readonly HealthScoreCalculator _healthScoreCalculator;

    public CopilotFunctionDispatcher(
        IVehicleService vehicleService,
        IFuelEntryService fuelEntryService,
        IServiceRecordService serviceRecordService,
        IExpenseService expenseService,
        IInsuranceService insuranceService,
        IPucCertificateService pucService,
        IReminderService reminderService,
        IDocumentService documentService,
        IAnalyticsService analyticsService,
        HealthScoreCalculator healthScoreCalculator)
    {
        _vehicleService = vehicleService;
        _fuelEntryService = fuelEntryService;
        _serviceRecordService = serviceRecordService;
        _expenseService = expenseService;
        _insuranceService = insuranceService;
        _pucService = pucService;
        _reminderService = reminderService;
        _documentService = documentService;
        _analyticsService = analyticsService;
        _healthScoreCalculator = healthScoreCalculator;
    }

    /// <summary>
    /// Executes a function call requested by the LLM and returns a JSON string result.
    /// </summary>
    public async Task<string> DispatchAsync(string functionName, JsonElement? arguments, int userId)
    {
        object result = functionName switch
        {
            "GetDashboardOverview" => await GetDashboardOverview(userId),
            "GetVehicleSummary" => await GetVehicleSummary(userId),
            "GetVehicleDetails" => await GetVehicleDetails(GetIntArg(arguments, "vehicleId"), userId),
            "CompareVehicles" => await CompareVehicles(userId),
            "GetVehicleHealthScore" => await GetVehicleHealthScore(userId, GetOptionalIntArg(arguments, "vehicleId")),
            "GetFuelSummary" => await GetFuelSummary(userId),
            "GetFuelTrend" => await GetFuelTrend(userId),
            "GetExpenseSummary" => await GetExpenseSummary(userId),
            "GetExpenseBreakdown" => await GetExpenseBreakdown(userId),
            "GetMaintenanceSummary" => await GetMaintenanceSummary(userId),
            "GetInsuranceStatus" => await GetInsuranceStatus(userId),
            "GetPUCStatus" => await GetPUCStatus(userId),
            "GetReminderSummary" => await GetReminderSummary(userId),
            "GetDocumentStatus" => await GetDocumentStatus(userId),
            "GetFleetAnalytics" => await GetFleetAnalytics(userId),
            "GetMonthlyReport" => await GetMonthlyReport(userId),
            "GetTopExpenses" => await GetTopExpenses(userId, GetOptionalIntArg(arguments, "count") ?? 5),
            _ => new { error = $"Unknown function: {functionName}" }
        };

        return JsonSerializer.Serialize(result, new JsonSerializerOptions { WriteIndented = false, PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
    }

    /// <summary>
    /// Returns the Gemini function declarations for all available Copilot functions.
    /// </summary>
    public static List<object> GetFunctionDeclarations()
    {
        return new List<object>
        {
            Fn("GetDashboardOverview", "Get a complete dashboard overview including vehicle count, total expenses, upcoming reminders, expiring insurance/PUC, and alerts."),
            Fn("GetVehicleSummary", "List all vehicles owned by the user with key details like make, model, year, registration number, fuel type, and current odometer."),
            FnWithParams("GetVehicleDetails", "Get deep details about a specific vehicle including fuel entries, service records, and expenses.",
                new { vehicleId = Param("integer", "The ID of the vehicle to inspect") }),
            Fn("CompareVehicles", "Compare all vehicles side-by-side on cost-per-km, fuel efficiency, total spending, and health score."),
            FnWithOptionalParams("GetVehicleHealthScore", "Calculate the health score (0-100) for one or all vehicles. Considers insurance, PUC, maintenance, fuel anomalies, and reminders.",
                new { vehicleId = OptParam("integer", "Optional vehicle ID. If omitted, returns all vehicles.") }),
            Fn("GetFuelSummary", "Get fuel statistics: total fuel cost, total liters, average mileage (km/L), and per-vehicle breakdown."),
            Fn("GetFuelTrend", "Get monthly fuel spending and efficiency trends over recent months."),
            Fn("GetExpenseSummary", "Get total spending summary with breakdown by expense category (Fuel, Service, Insurance, Toll, etc.)."),
            Fn("GetExpenseBreakdown", "Get detailed expense breakdown per vehicle and per category."),
            Fn("GetMaintenanceSummary", "Get maintenance/service history overview: total services, total cost, recent services, and upcoming service predictions."),
            Fn("GetInsuranceStatus", "Get insurance policy status for all vehicles: active, expiring soon, or expired."),
            Fn("GetPUCStatus", "Get PUC certificate status for all vehicles: valid, expiring soon, or expired."),
            Fn("GetReminderSummary", "Get all reminders: pending, overdue, snoozed, and completed counts with details."),
            Fn("GetDocumentStatus", "Get document inventory: count by document type, recent uploads, and per-vehicle document coverage."),
            Fn("GetFleetAnalytics", "Get comprehensive fleet analytics: cost-per-km, fuel anomalies, service predictions, and spending forecasts."),
            Fn("GetMonthlyReport", "Get month-over-month comparison of expenses and fuel spending for the last 3 months."),
            FnWithOptionalParams("GetTopExpenses", "Get the top N most expensive transactions.",
                new { count = OptParam("integer", "Number of top expenses to return. Default is 5.") }),
        };
    }

    // ─── Function Implementations ───────────────────────────────────────

    private async Task<object> GetDashboardOverview(int userId)
    {
        var vehicles = await _vehicleService.GetVehiclesByUserIdAsync(userId);
        var expenses = await _expenseService.GetExpensesByUserIdAsync(userId);
        var reminders = await _reminderService.GetRemindersAsync(userId, pendingOnly: false);
        var insurances = await _insuranceService.GetInsurancesByUserIdAsync(userId);
        var pucs = await _pucService.GetPucsByUserIdAsync(userId);
        var healthScores = await _healthScoreCalculator.GetAllHealthScoresAsync(userId);

        var now = DateTime.UtcNow;
        var thisMonth = expenses.Where(e => e.Date.Month == now.Month && e.Date.Year == now.Year);

        return new
        {
            totalVehicles = vehicles.Count,
            totalExpenses = expenses.Sum(e => e.Amount),
            thisMonthExpenses = thisMonth.Sum(e => e.Amount),
            pendingReminders = reminders.Count(r => r.Status == Models.Enums.ReminderStatus.Pending),
            overdueReminders = reminders.Count(r => r.Status == Models.Enums.ReminderStatus.Pending && r.DueDate < now),
            expiringInsurance = insurances.Where(i => { var d = (i.EndDate - now).Days; return d >= 0 && d <= 30; }).Select(i => new { i.VehicleId, i.Provider, daysLeft = (i.EndDate - now).Days }),
            expiredInsurance = insurances.Where(i => i.EndDate < now).Select(i => new { i.VehicleId, i.Provider }),
            expiringPuc = pucs.Where(p => { var d = (p.ExpiryDate - now).Days; return d >= 0 && d <= 30; }).Select(p => new { p.VehicleId, daysLeft = (p.ExpiryDate - now).Days }),
            vehicleHealthScores = healthScores.Select(h => new { h.VehicleName, h.Score, h.Tier, h.TierEmoji }),
        };
    }

    private async Task<object> GetVehicleSummary(int userId)
    {
        var vehicles = await _vehicleService.GetVehiclesByUserIdAsync(userId);
        return new { totalVehicles = vehicles.Count, vehicles = vehicles.Select(v => new { v.Id, v.Make, v.Model, v.Year, v.RegistrationNumber, v.FuelType, v.VehicleType, v.CurrentOdometer, v.Color }) };
    }

    private async Task<object> GetVehicleDetails(int vehicleId, int userId)
    {
        var vehicle = await _vehicleService.GetVehicleByIdAsync(vehicleId, userId);
        var fuelEntries = await _fuelEntryService.GetFuelEntriesByVehicleIdAsync(vehicleId, userId);
        var services = await _serviceRecordService.GetServiceRecordsByVehicleIdAsync(vehicleId, userId);
        var expenses = await _expenseService.GetExpensesByVehicleIdAsync(vehicleId, userId);
        var healthScore = await _healthScoreCalculator.GetHealthScoreAsync(vehicleId, userId);

        return new
        {
            vehicle = new { vehicle.Id, vehicle.Make, vehicle.Model, vehicle.Year, vehicle.RegistrationNumber, vehicle.FuelType, vehicle.CurrentOdometer },
            totalFuelEntries = fuelEntries.Count,
            totalFuelCost = fuelEntries.Sum(f => f.TotalCost),
            averageMileage = fuelEntries.Where(f => f.CalculatedMileage.HasValue).Select(f => f.CalculatedMileage!.Value).DefaultIfEmpty(0).Average(),
            totalServiceRecords = services.Count,
            totalServiceCost = services.Sum(s => s.Cost),
            totalExpenses = expenses.Sum(e => e.Amount),
            recentServices = services.OrderByDescending(s => s.Date).Take(3).Select(s => new { s.ServiceType, s.Date, s.Cost, s.GarageName }),
            healthScore = healthScore != null ? new { healthScore.Score, healthScore.Tier, healthScore.TierEmoji, healthScore.Deductions } : null,
        };
    }

    private async Task<object> CompareVehicles(int userId)
    {
        var analytics = await _analyticsService.GetFleetSummaryAnalyticsAsync(userId);
        var healthScores = await _healthScoreCalculator.GetAllHealthScoresAsync(userId);

        return new
        {
            vehicles = analytics.VehicleSummaries.Select(v =>
            {
                var health = healthScores.FirstOrDefault(h => h.VehicleId == v.VehicleId);
                return new
                {
                    v.VehicleId, v.VehicleName, v.CostPerKm, v.BaselineMileageKmL,
                    v.TotalSpentAmount, v.TotalDistanceTraveledKm,
                    anomalies = v.FuelAnomalies.Count,
                    healthScore = health?.Score ?? 0,
                    healthTier = health?.Tier ?? "Unknown",
                };
            }),
        };
    }

    private async Task<object> GetVehicleHealthScore(int userId, int? vehicleId)
    {
        if (vehicleId.HasValue)
        {
            var score = await _healthScoreCalculator.GetHealthScoreAsync(vehicleId.Value, userId);
            return score ?? (object)new { error = "Vehicle not found" };
        }
        return await _healthScoreCalculator.GetAllHealthScoresAsync(userId);
    }

    private async Task<object> GetFuelSummary(int userId)
    {
        var entries = await _fuelEntryService.GetFuelEntriesByUserIdAsync(userId);
        var vehicles = await _vehicleService.GetVehiclesByUserIdAsync(userId);

        return new
        {
            totalEntries = entries.Count,
            totalFuelCost = entries.Sum(f => f.TotalCost),
            totalLiters = entries.Sum(f => f.Quantity),
            averageMileageKmL = entries.Where(f => f.CalculatedMileage.HasValue).Select(f => f.CalculatedMileage!.Value).DefaultIfEmpty(0).Average(),
            averagePricePerLiter = entries.Count > 0 ? entries.Average(f => f.PricePerLiter) : 0,
            perVehicle = vehicles.Select(v =>
            {
                var vEntries = entries.Where(f => f.VehicleId == v.Id).ToList();
                return new
                {
                    vehicleName = $"{v.Make} {v.Model}",
                    totalCost = vEntries.Sum(f => f.TotalCost),
                    totalLiters = vEntries.Sum(f => f.Quantity),
                    avgMileage = vEntries.Where(f => f.CalculatedMileage.HasValue).Select(f => f.CalculatedMileage!.Value).DefaultIfEmpty(0).Average(),
                    entries = vEntries.Count,
                };
            }),
        };
    }

    private async Task<object> GetFuelTrend(int userId)
    {
        var entries = await _fuelEntryService.GetFuelEntriesByUserIdAsync(userId);
        var monthly = entries
            .GroupBy(f => new { f.Date.Year, f.Date.Month })
            .OrderByDescending(g => g.Key.Year).ThenByDescending(g => g.Key.Month)
            .Take(6)
            .Select(g => new
            {
                month = $"{g.Key.Year}-{g.Key.Month:D2}",
                totalCost = g.Sum(f => f.TotalCost),
                totalLiters = g.Sum(f => f.Quantity),
                avgMileage = g.Where(f => f.CalculatedMileage.HasValue).Select(f => f.CalculatedMileage!.Value).DefaultIfEmpty(0).Average(),
                entries = g.Count(),
            });
        return new { monthlyTrend = monthly };
    }

    private async Task<object> GetExpenseSummary(int userId)
    {
        var expenses = await _expenseService.GetExpensesByUserIdAsync(userId);
        var now = DateTime.UtcNow;

        return new
        {
            totalExpenses = expenses.Sum(e => e.Amount),
            totalTransactions = expenses.Count,
            thisMonthTotal = expenses.Where(e => e.Date.Month == now.Month && e.Date.Year == now.Year).Sum(e => e.Amount),
            lastMonthTotal = expenses.Where(e => e.Date.Month == now.AddMonths(-1).Month && e.Date.Year == now.AddMonths(-1).Year).Sum(e => e.Amount),
            byCategory = expenses.GroupBy(e => e.Category.ToString()).Select(g => new { category = g.Key, total = g.Sum(e => e.Amount), count = g.Count() }).OrderByDescending(g => g.total),
        };
    }

    private async Task<object> GetExpenseBreakdown(int userId)
    {
        var expenses = await _expenseService.GetExpensesByUserIdAsync(userId);
        var vehicles = await _vehicleService.GetVehiclesByUserIdAsync(userId);

        return new
        {
            perVehicle = vehicles.Select(v =>
            {
                var vExpenses = expenses.Where(e => e.VehicleId == v.Id).ToList();
                return new
                {
                    vehicleName = $"{v.Make} {v.Model}",
                    total = vExpenses.Sum(e => e.Amount),
                    byCategory = vExpenses.GroupBy(e => e.Category.ToString()).Select(g => new { category = g.Key, total = g.Sum(e => e.Amount) }),
                };
            }),
            unassigned = expenses.Where(e => !e.VehicleId.HasValue).Sum(e => e.Amount),
        };
    }

    private async Task<object> GetMaintenanceSummary(int userId)
    {
        var services = await _serviceRecordService.GetServiceRecordsByUserIdAsync(userId);
        var analytics = await _analyticsService.GetFleetSummaryAnalyticsAsync(userId);

        return new
        {
            totalServiceRecords = services.Count,
            totalMaintenanceCost = services.Sum(s => s.Cost),
            recentServices = services.OrderByDescending(s => s.Date).Take(5).Select(s => new { s.ServiceType, s.Date, s.Cost, s.GarageName, s.Description }),
            upcomingServices = analytics.VehicleSummaries
                .Where(v => v.ServicePrediction != null)
                .Select(v => new { v.VehicleName, v.ServicePrediction!.UrgencyLevel, v.ServicePrediction.DaysUntilService, v.ServicePrediction.EstimatedServiceDate }),
            byServiceType = services.GroupBy(s => s.ServiceType.ToString()).Select(g => new { type = g.Key, count = g.Count(), totalCost = g.Sum(s => s.Cost) }),
        };
    }

    private async Task<object> GetInsuranceStatus(int userId)
    {
        var insurances = await _insuranceService.GetInsurancesByUserIdAsync(userId);
        var vehicles = await _vehicleService.GetVehiclesByUserIdAsync(userId);
        var now = DateTime.UtcNow;

        return new
        {
            totalPolicies = insurances.Count,
            totalPremiums = insurances.Sum(i => i.PremiumAmount),
            active = insurances.Where(i => i.EndDate > now).Select(i => new
            {
                vehicleName = vehicles.FirstOrDefault(v => v.Id == i.VehicleId) is var v && v != null ? $"{v.Make} {v.Model}" : "Unknown",
                i.Provider, i.PolicyNumber, i.CoverageType, i.EndDate,
                daysLeft = (i.EndDate - now).Days,
            }),
            expired = insurances.Where(i => i.EndDate <= now).Select(i => new
            {
                vehicleName = vehicles.FirstOrDefault(v => v.Id == i.VehicleId) is var v && v != null ? $"{v.Make} {v.Model}" : "Unknown",
                i.Provider, i.PolicyNumber, i.EndDate,
            }),
        };
    }

    private async Task<object> GetPUCStatus(int userId)
    {
        var pucs = await _pucService.GetPucsByUserIdAsync(userId);
        var vehicles = await _vehicleService.GetVehiclesByUserIdAsync(userId);
        var now = DateTime.UtcNow;

        return new
        {
            totalCertificates = pucs.Count,
            valid = pucs.Where(p => p.ExpiryDate > now).Select(p => new
            {
                vehicleName = vehicles.FirstOrDefault(v => v.Id == p.VehicleId) is var v && v != null ? $"{v.Make} {v.Model}" : "Unknown",
                p.CertificateNumber, p.ExpiryDate,
                daysLeft = (p.ExpiryDate - now).Days,
            }),
            expired = pucs.Where(p => p.ExpiryDate <= now).Select(p => new
            {
                vehicleName = vehicles.FirstOrDefault(v => v.Id == p.VehicleId) is var v && v != null ? $"{v.Make} {v.Model}" : "Unknown",
                p.CertificateNumber, p.ExpiryDate,
            }),
        };
    }

    private async Task<object> GetReminderSummary(int userId)
    {
        var reminders = await _reminderService.GetRemindersAsync(userId, pendingOnly: false);
        var now = DateTime.UtcNow;

        return new
        {
            total = reminders.Count,
            pending = reminders.Count(r => r.Status == Models.Enums.ReminderStatus.Pending),
            overdue = reminders.Count(r => r.Status == Models.Enums.ReminderStatus.Pending && r.DueDate < now),
            completed = reminders.Count(r => r.Status == Models.Enums.ReminderStatus.Completed),
            snoozed = reminders.Count(r => r.Status == Models.Enums.ReminderStatus.Snoozed),
            upcomingReminders = reminders
                .Where(r => r.Status == Models.Enums.ReminderStatus.Pending && r.DueDate >= now)
                .OrderBy(r => r.DueDate).Take(5)
                .Select(r => new { r.Title, r.DueDate, r.ReminderType, r.Description }),
            overdueDetails = reminders
                .Where(r => r.Status == Models.Enums.ReminderStatus.Pending && r.DueDate < now)
                .Select(r => new { r.Title, r.DueDate, r.ReminderType, daysOverdue = (now - r.DueDate).Days }),
        };
    }

    private async Task<object> GetDocumentStatus(int userId)
    {
        var documents = await _documentService.GetDocumentsByUserIdAsync(userId);
        var vehicles = await _vehicleService.GetVehiclesByUserIdAsync(userId);

        return new
        {
            totalDocuments = documents.Count,
            byType = documents.GroupBy(d => d.DocumentType.ToString()).Select(g => new { type = g.Key, count = g.Count() }),
            recentUploads = documents.OrderByDescending(d => d.CreatedAt).Take(5).Select(d => new { d.OriginalFileName, d.DocumentType, d.CreatedAt }),
            perVehicle = vehicles.Select(v => new
            {
                vehicleName = $"{v.Make} {v.Model}",
                documentCount = documents.Count(d => d.VehicleId == v.Id),
            }),
        };
    }

    private async Task<object> GetFleetAnalytics(int userId)
    {
        var analytics = await _analyticsService.GetFleetSummaryAnalyticsAsync(userId);
        return new
        {
            analytics.TotalVehicles, analytics.TotalFleetSpend, analytics.AverageFleetCostPerKm,
            analytics.AverageFleetMileageKmL, analytics.ActiveAnomaliesCount, analytics.UpcomingServicesCount,
            analytics.ForecastNext30DaysSpend, analytics.ForecastNext90DaysSpend,
            analytics.KeyRecommendations,
            vehicleSummaries = analytics.VehicleSummaries.Select(v => new
            {
                v.VehicleName, v.CostPerKm, v.BaselineMileageKmL, v.TotalSpentAmount,
                anomalies = v.FuelAnomalies.Count,
                serviceUrgency = v.ServicePrediction?.UrgencyLevel ?? "N/A",
            }),
        };
    }

    private async Task<object> GetMonthlyReport(int userId)
    {
        var expenses = await _expenseService.GetExpensesByUserIdAsync(userId);
        var fuelEntries = await _fuelEntryService.GetFuelEntriesByUserIdAsync(userId);
        var now = DateTime.UtcNow;

        var months = Enumerable.Range(0, 3).Select(i => now.AddMonths(-i)).ToList();
        return new
        {
            monthlyComparison = months.Select(m => new
            {
                month = $"{m.Year}-{m.Month:D2}",
                totalExpenses = expenses.Where(e => e.Date.Month == m.Month && e.Date.Year == m.Year).Sum(e => e.Amount),
                fuelCost = fuelEntries.Where(f => f.Date.Month == m.Month && f.Date.Year == m.Year).Sum(f => f.TotalCost),
                fuelLiters = fuelEntries.Where(f => f.Date.Month == m.Month && f.Date.Year == m.Year).Sum(f => f.Quantity),
            }),
        };
    }

    private async Task<object> GetTopExpenses(int userId, int count)
    {
        var expenses = await _expenseService.GetExpensesByUserIdAsync(userId);
        var vehicles = await _vehicleService.GetVehiclesByUserIdAsync(userId);

        return new
        {
            topExpenses = expenses.OrderByDescending(e => e.Amount).Take(count).Select(e => new
            {
                e.Amount, e.Category, e.Date, e.Description,
                vehicleName = e.VehicleId.HasValue
                    ? vehicles.FirstOrDefault(v => v.Id == e.VehicleId) is var v && v != null ? $"{v.Make} {v.Model}" : "Unknown"
                    : "General",
            }),
        };
    }

    // ─── Helpers ──────────────────────────────────────────

    private static int GetIntArg(JsonElement? args, string name)
    {
        if (args.HasValue && args.Value.TryGetProperty(name, out var prop))
            return prop.GetInt32();
        return 0;
    }

    private static int? GetOptionalIntArg(JsonElement? args, string name)
    {
        if (args.HasValue && args.Value.TryGetProperty(name, out var prop) && prop.ValueKind == JsonValueKind.Number)
            return prop.GetInt32();
        return null;
    }

    // ─── Function Declaration Builders ──────────────────

    private static object Fn(string name, string description) => new
    {
        name,
        description,
        parameters = new { type = "object", properties = new { }, required = Array.Empty<string>() }
    };

    private static object FnWithParams(string name, string description, object properties) => new
    {
        name,
        description,
        parameters = new { type = "object", properties, required = properties.GetType().GetProperties().Select(p => p.Name).ToArray() }
    };

    private static object FnWithOptionalParams(string name, string description, object properties) => new
    {
        name,
        description,
        parameters = new { type = "object", properties, required = Array.Empty<string>() }
    };

    private static object Param(string type, string description) => new { type, description };
    private static object OptParam(string type, string description) => new { type, description };
}
