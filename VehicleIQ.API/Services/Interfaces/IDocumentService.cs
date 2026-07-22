using Microsoft.AspNetCore.Http;
using VehicleIQ.API.DTOs;
using VehicleIQ.API.Models.Enums;

namespace VehicleIQ.API.Services.Interfaces;

public interface IDocumentService
{
    Task<IReadOnlyList<DocumentDto>> GetDocumentsByUserIdAsync(int userId);
    Task<IReadOnlyList<DocumentDto>> GetDocumentsByVehicleIdAsync(int vehicleId, int userId);
    Task<DocumentDto> UploadDocumentAsync(
        int userId, 
        int? vehicleId, 
        DocumentType documentType, 
        IFormFile file, 
        string? referenceType = null, 
        int? referenceId = null
    );
    Task<(byte[] fileContents, string contentType, string originalFileName)> GetDocumentFileAsync(int id, int userId);
    Task DeleteDocumentAsync(int id, int userId);
}
