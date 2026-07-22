using VehicleIQ.API.DTOs;
using VehicleIQ.API.Exceptions;
using VehicleIQ.API.Models.Entities;
using VehicleIQ.API.Models.Enums;
using VehicleIQ.API.Repositories.Interfaces;
using VehicleIQ.API.Services.Interfaces;

namespace VehicleIQ.API.Services.Implementations;

public class InsuranceService : IInsuranceService
{
    private readonly IInsuranceRepository _insuranceRepository;
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IExpenseService _expenseService;
    private readonly IExpenseRepository _expenseRepository;
    private readonly IReminderRepository _reminderRepository;

    public InsuranceService(
        IInsuranceRepository insuranceRepository,
        IVehicleRepository vehicleRepository,
        IExpenseService expenseService,
        IExpenseRepository expenseRepository,
        IReminderRepository reminderRepository)
    {
        _insuranceRepository = insuranceRepository;
        _vehicleRepository = vehicleRepository;
        _expenseService = expenseService;
        _expenseRepository = expenseRepository;
        _reminderRepository = reminderRepository;
    }

    public async Task<IReadOnlyList<InsuranceDto>> GetInsurancesByUserIdAsync(int userId)
    {
        var insurances = await _insuranceRepository.GetByUserIdAsync(userId);
        return insurances.Select(i => i.ToDto()).ToList().AsReadOnly();
    }

    public async Task<IReadOnlyList<InsuranceDto>> GetInsurancesByVehicleIdAsync(int vehicleId, int userId)
    {
        // Guard: Verify vehicle exists and belongs to user
        var vehicle = await _vehicleRepository.GetByIdAndUserIdAsync(vehicleId, userId);
        if (vehicle == null)
        {
            throw new NotFoundException($"Vehicle with ID {vehicleId} was not found.");
        }

        var insurances = await _insuranceRepository.GetByVehicleIdAsync(vehicleId);
        return insurances.Select(i => i.ToDto()).ToList().AsReadOnly();
    }

    public async Task<InsuranceDto> CreateInsuranceAsync(CreateInsuranceRequest request, int userId)
    {
        // 1. Guard: Verify vehicle exists and belongs to user
        var vehicle = await _vehicleRepository.GetByIdAndUserIdAsync(request.VehicleId, userId);
        if (vehicle == null)
        {
            throw new NotFoundException($"Vehicle with ID {request.VehicleId} was not found.");
        }

        if (request.EndDate <= request.StartDate)
        {
            throw new BadRequestException("Policy End Date must be greater than Start Date.");
        }

        // 2. Create Insurance Entity
        var insurance = request.ToEntity();
        var created = await _insuranceRepository.AddAsync(insurance);

        // 3. Auto-generate corresponding Expense record
        await _expenseService.CreateSystemExpenseAsync(
            userId: userId,
            vehicleId: request.VehicleId,
            date: request.StartDate,
            category: ExpenseCategory.Insurance,
            amount: created.PremiumAmount,
            description: $"Insurance Premium: {created.Provider} - Policy: {created.PolicyNumber}",
            referenceType: "Insurance",
            referenceId: created.Id
        );

        // 4. Auto-schedule Expiry Reminder (15 days before expiration, fallback to UtcNow if already close)
        var reminderDate = created.EndDate.AddDays(-15);
        if (reminderDate < DateTime.UtcNow)
        {
            reminderDate = DateTime.UtcNow;
        }

        var reminder = new Reminder
        {
            UserId = userId,
            VehicleId = request.VehicleId,
            Title = $"Insurance expiring for {vehicle.Make} {vehicle.Model}",
            Description = $"Policy {created.PolicyNumber} from {created.Provider} expires on {created.EndDate:yyyy-MM-dd}.",
            DueDate = reminderDate,
            ReminderType = ReminderType.InsuranceExpiry,
            Status = ReminderStatus.Pending,
            ReferenceType = "Insurance",
            ReferenceId = created.Id
        };
        await _reminderRepository.AddAsync(reminder);

        return created.ToDto();
    }

    public async Task DeleteInsuranceAsync(int id, int userId)
    {
        var insurance = await _insuranceRepository.GetByIdAsync(id);
        if (insurance == null)
        {
            throw new NotFoundException($"Insurance policy with ID {id} was not found.");
        }

        // Verify ownership
        var vehicle = await _vehicleRepository.GetByIdAndUserIdAsync(insurance.VehicleId, userId);
        if (vehicle == null)
        {
            throw new NotFoundException($"Associated vehicle was not found.");
        }

        // Delete the policy
        await _insuranceRepository.DeleteAsync(insurance);

        // Clean up the associated auto-generated expense
        var associatedExpenses = await _expenseRepository.GetByVehicleIdAsync(insurance.VehicleId);
        var expenseToDelete = associatedExpenses.FirstOrDefault(e => e.ReferenceType == "Insurance" && e.ReferenceId == id);
        if (expenseToDelete != null)
        {
            await _expenseRepository.DeleteAsync(expenseToDelete);
        }

        // Clean up the associated auto-scheduled reminder
        var associatedReminders = await _reminderRepository.GetByUserIdAsync(userId, false);
        var reminderToDelete = associatedReminders.FirstOrDefault(r => r.ReferenceType == "Insurance" && r.ReferenceId == id);
        if (reminderToDelete != null)
        {
            await _reminderRepository.DeleteAsync(reminderToDelete);
        }
    }
}
