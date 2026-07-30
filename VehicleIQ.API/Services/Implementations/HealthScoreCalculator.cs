using VehicleIQ.API.DTOs;
using VehicleIQ.API.DTOs.Copilot;
using VehicleIQ.API.Services.Interfaces;

namespace VehicleIQ.API.Services.Implementations;

/// <summary>
/// Computes a 0–100 Vehicle Health Score based on insurance, PUC, service,
/// fuel anomalies, and pending reminders. Reuses existing service interfaces.
/// </summary>
public class HealthScoreCalculator
{
    private readonly IVehicleService _vehicleService;
    private readonly IInsuranceService _insuranceService;
    private readonly IPucCertificateService _pucService;
    private readonly IReminderService _reminderService;
    private readonly IAnalyticsService _analyticsService;

    public HealthScoreCalculator(
        IVehicleService vehicleService,
        IInsuranceService insuranceService,
        IPucCertificateService pucService,
        IReminderService reminderService,
        IAnalyticsService analyticsService)
    {
        _vehicleService = vehicleService;
        _insuranceService = insuranceService;
        _pucService = pucService;
        _reminderService = reminderService;
        _analyticsService = analyticsService;
    }

    public async Task<List<VehicleHealthScoreDto>> GetAllHealthScoresAsync(int userId)
    {
        var vehicles = await _vehicleService.GetVehiclesByUserIdAsync(userId);
        var allInsurances = await _insuranceService.GetInsurancesByUserIdAsync(userId);
        var allPucs = await _pucService.GetPucsByUserIdAsync(userId);
        var allReminders = await _reminderService.GetRemindersAsync(userId, pendingOnly: false);
        var fleetAnalytics = await _analyticsService.GetFleetSummaryAnalyticsAsync(userId);

        var results = new List<VehicleHealthScoreDto>();

        foreach (var vehicle in vehicles)
        {
            var score = 100;
            var deductions = new List<string>();

            // ── Insurance Health ──
            var vehicleInsurance = allInsurances
                .Where(i => i.VehicleId == vehicle.Id)
                .OrderByDescending(i => i.EndDate)
                .FirstOrDefault();

            if (vehicleInsurance != null)
            {
                var daysLeft = (vehicleInsurance.EndDate - DateTime.UtcNow).Days;
                if (daysLeft < 0) { score -= 25; deductions.Add($"Insurance expired {Math.Abs(daysLeft)} days ago (−25)"); }
                else if (daysLeft <= 7) { score -= 15; deductions.Add($"Insurance expires in {daysLeft} days (−15)"); }
                else if (daysLeft <= 30) { score -= 5; deductions.Add($"Insurance expires in {daysLeft} days (−5)"); }
            }
            else
            {
                score -= 15;
                deductions.Add("No insurance record found (−15)");
            }

            // ── PUC Health ──
            var vehiclePuc = allPucs
                .Where(p => p.VehicleId == vehicle.Id)
                .OrderByDescending(p => p.ExpiryDate)
                .FirstOrDefault();

            if (vehiclePuc != null)
            {
                var daysLeft = (vehiclePuc.ExpiryDate - DateTime.UtcNow).Days;
                if (daysLeft < 0) { score -= 20; deductions.Add($"PUC expired {Math.Abs(daysLeft)} days ago (−20)"); }
                else if (daysLeft <= 7) { score -= 10; deductions.Add($"PUC expires in {daysLeft} days (−10)"); }
                else if (daysLeft <= 15) { score -= 5; deductions.Add($"PUC expires in {daysLeft} days (−5)"); }
            }
            else
            {
                score -= 10;
                deductions.Add("No PUC record found (−10)");
            }

            // ── Overdue Reminders ──
            var overdueReminders = allReminders
                .Where(r => r.VehicleId == vehicle.Id
                    && r.Status == Models.Enums.ReminderStatus.Pending
                    && r.DueDate < DateTime.UtcNow)
                .ToList();

            if (overdueReminders.Count > 0)
            {
                var deduction = Math.Min(overdueReminders.Count * 5, 20);
                score -= deduction;
                deductions.Add($"{overdueReminders.Count} overdue reminder(s) (−{deduction})");
            }

            // ── Fuel Anomalies ──
            var vehicleAnalytics = fleetAnalytics.VehicleSummaries
                .FirstOrDefault(v => v.VehicleId == vehicle.Id);

            if (vehicleAnalytics != null && vehicleAnalytics.FuelAnomalies.Count > 0)
            {
                var deduction = Math.Min(vehicleAnalytics.FuelAnomalies.Count * 15, 30);
                score -= deduction;
                deductions.Add($"{vehicleAnalytics.FuelAnomalies.Count} fuel anomaly/anomalies detected (−{deduction})");
            }

            // ── Service Prediction ──
            if (vehicleAnalytics?.ServicePrediction != null)
            {
                var urgency = vehicleAnalytics.ServicePrediction.UrgencyLevel;
                if (urgency == "Overdue") { score -= 15; deductions.Add("Service is overdue (−15)"); }
                else if (urgency == "Urgent") { score -= 8; deductions.Add("Service is urgently due (−8)"); }
            }

            score = Math.Max(0, score);

            var (tier, emoji) = score switch
            {
                >= 90 => ("Excellent", "🟢"),
                >= 75 => ("Good", "🟢"),
                >= 55 => ("Average", "🟡"),
                >= 35 => ("Needs Attention", "🟠"),
                _     => ("Critical", "🔴"),
            };

            if (deductions.Count == 0)
            {
                deductions.Add("All health indicators are optimal ✅");
            }

            results.Add(new VehicleHealthScoreDto(
                vehicle.Id,
                $"{vehicle.Make} {vehicle.Model}",
                score,
                tier,
                emoji,
                deductions
            ));
        }

        return results;
    }

    public async Task<VehicleHealthScoreDto?> GetHealthScoreAsync(int vehicleId, int userId)
    {
        var all = await GetAllHealthScoresAsync(userId);
        return all.FirstOrDefault(h => h.VehicleId == vehicleId);
    }
}
