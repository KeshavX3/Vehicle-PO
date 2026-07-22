using VehicleIQ.API.DTOs;
using VehicleIQ.API.Exceptions;
using VehicleIQ.API.Models.Entities;
using VehicleIQ.API.Models.Enums;
using VehicleIQ.API.Repositories.Interfaces;
using VehicleIQ.API.Services.Interfaces;

namespace VehicleIQ.API.Services.Implementations;

public class PucCertificateService : IPucCertificateService
{
    private readonly IPucCertificateRepository _pucCertificateRepository;
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IReminderRepository _reminderRepository;

    public PucCertificateService(
        IPucCertificateRepository pucCertificateRepository,
        IVehicleRepository vehicleRepository,
        IReminderRepository reminderRepository)
    {
        _pucCertificateRepository = pucCertificateRepository;
        _vehicleRepository = vehicleRepository;
        _reminderRepository = reminderRepository;
    }

    public async Task<IReadOnlyList<PucCertificateDto>> GetPucsByUserIdAsync(int userId)
    {
        var pucs = await _pucCertificateRepository.GetByUserIdAsync(userId);
        return pucs.Select(p => p.ToDto()).ToList().AsReadOnly();
    }

    public async Task<IReadOnlyList<PucCertificateDto>> GetPucsByVehicleIdAsync(int vehicleId, int userId)
    {
        // Guard: Verify vehicle exists and belongs to user
        var vehicle = await _vehicleRepository.GetByIdAndUserIdAsync(vehicleId, userId);
        if (vehicle == null)
        {
            throw new NotFoundException($"Vehicle with ID {vehicleId} was not found.");
        }

        var pucs = await _pucCertificateRepository.GetByVehicleIdAsync(vehicleId);
        return pucs.Select(p => p.ToDto()).ToList().AsReadOnly();
    }

    public async Task<PucCertificateDto> CreatePucCertificateAsync(CreatePucCertificateRequest request, int userId)
    {
        // 1. Guard: Verify vehicle exists and belongs to user
        var vehicle = await _vehicleRepository.GetByIdAndUserIdAsync(request.VehicleId, userId);
        if (vehicle == null)
        {
            throw new NotFoundException($"Vehicle with ID {request.VehicleId} was not found.");
        }

        if (request.ExpiryDate <= request.Date)
        {
            throw new BadRequestException("PUC Expiry Date must be greater than issue Date.");
        }

        // 2. Create PUC Entity
        var puc = request.ToEntity();
        var created = await _pucCertificateRepository.AddAsync(puc);

        // 3. Auto-schedule Expiry Reminder (7 days before expiration, fallback to UtcNow if already close)
        var reminderDate = created.ExpiryDate.AddDays(-7);
        if (reminderDate < DateTime.UtcNow)
        {
            reminderDate = DateTime.UtcNow;
        }

        var reminder = new Reminder
        {
            UserId = userId,
            VehicleId = request.VehicleId,
            Title = $"PUC expiring for {vehicle.Make} {vehicle.Model}",
            Description = $"PUC Certificate {created.CertificateNumber ?? "N/A"} expires on {created.ExpiryDate:yyyy-MM-dd}.",
            DueDate = reminderDate,
            ReminderType = ReminderType.PUCExpiry,
            Status = ReminderStatus.Pending,
            ReferenceType = "PucCertificate",
            ReferenceId = created.Id
        };
        await _reminderRepository.AddAsync(reminder);

        return created.ToDto();
    }

    public async Task DeletePucCertificateAsync(int id, int userId)
    {
        var puc = await _pucCertificateRepository.GetByIdAsync(id);
        if (puc == null)
        {
            throw new NotFoundException($"PUC certificate with ID {id} was not found.");
        }

        // Verify ownership
        var vehicle = await _vehicleRepository.GetByIdAndUserIdAsync(puc.VehicleId, userId);
        if (vehicle == null)
        {
            throw new NotFoundException($"Associated vehicle was not found.");
        }

        // Delete PUC record
        await _pucCertificateRepository.DeleteAsync(puc);

        // Clean up the associated auto-scheduled reminder
        var associatedReminders = await _reminderRepository.GetByUserIdAsync(userId, false);
        var reminderToDelete = associatedReminders.FirstOrDefault(r => r.ReferenceType == "PucCertificate" && r.ReferenceId == id);
        if (reminderToDelete != null)
        {
            await _reminderRepository.DeleteAsync(reminderToDelete);
        }
    }
}
