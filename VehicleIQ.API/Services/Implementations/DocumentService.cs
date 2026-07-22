using Microsoft.AspNetCore.Http;
using VehicleIQ.API.DTOs;
using VehicleIQ.API.Exceptions;
using VehicleIQ.API.Models.Entities;
using VehicleIQ.API.Models.Enums;
using VehicleIQ.API.Repositories.Interfaces;
using VehicleIQ.API.Services.Interfaces;

namespace VehicleIQ.API.Services.Implementations;

public class DocumentService : IDocumentService
{
    private readonly IDocumentRepository _documentRepository;
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IHostEnvironment _env;

    private const string UploadsFolderName = "uploads";

    public DocumentService(
        IDocumentRepository documentRepository,
        IVehicleRepository vehicleRepository,
        IHostEnvironment env)
    {
        _documentRepository = documentRepository;
        _vehicleRepository = vehicleRepository;
        _env = env;
    }

    public async Task<IReadOnlyList<DocumentDto>> GetDocumentsByUserIdAsync(int userId)
    {
        var docs = await _documentRepository.GetByUserIdAsync(userId);
        return docs.Select(d => d.ToDto()).ToList().AsReadOnly();
    }

    public async Task<IReadOnlyList<DocumentDto>> GetDocumentsByVehicleIdAsync(int vehicleId, int userId)
    {
        // Guard: Verify vehicle exists and belongs to user
        var vehicle = await _vehicleRepository.GetByIdAndUserIdAsync(vehicleId, userId);
        if (vehicle == null)
        {
            throw new NotFoundException($"Vehicle with ID {vehicleId} was not found.");
        }

        var docs = await _documentRepository.GetByVehicleIdAsync(vehicleId);
        return docs.Select(d => d.ToDto()).ToList().AsReadOnly();
    }

    public async Task<DocumentDto> UploadDocumentAsync(
        int userId, 
        int? vehicleId, 
        DocumentType documentType, 
        IFormFile file, 
        string? referenceType = null, 
        int? referenceId = null)
    {
        // 1. Guard: If vehicleId is specified, verify it exists and belongs to the user
        if (vehicleId.HasValue)
        {
            var vehicle = await _vehicleRepository.GetByIdAndUserIdAsync(vehicleId.Value, userId);
            if (vehicle == null)
            {
                throw new NotFoundException($"Vehicle with ID {vehicleId.Value} was not found.");
            }
        }

        if (file.Length == 0)
        {
            throw new BadRequestException("Uploaded file is empty.");
        }

        // 2. Ensure uploads directory exists
        var uploadsDirectory = Path.Combine(_env.ContentRootPath, UploadsFolderName);
        if (!Directory.Exists(uploadsDirectory))
        {
            Directory.CreateDirectory(uploadsDirectory);
        }

        // 3. Create unique filename to prevent duplicates/collisions and path traversal
        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var fileAbsolutePath = Path.Combine(uploadsDirectory, uniqueFileName);

        // 4. Save file to disk
        using (var fileStream = new FileStream(fileAbsolutePath, FileMode.Create))
        {
            await file.CopyToAsync(fileStream);
        }

        // 5. Create Document Entity
        var relativePath = Path.Combine(UploadsFolderName, uniqueFileName).Replace('\\', '/');
        var document = new Document
        {
            UserId = userId,
            VehicleId = vehicleId,
            DocumentType = documentType,
            FileName = uniqueFileName,
            OriginalFileName = file.FileName,
            FilePath = relativePath,
            ContentType = file.ContentType,
            FileSizeBytes = file.Length,
            ReferenceType = referenceType,
            ReferenceId = referenceId
        };

        var created = await _documentRepository.AddAsync(document);
        return created.ToDto();
    }

    public async Task<(byte[] fileContents, string contentType, string originalFileName)> GetDocumentFileAsync(int id, int userId)
    {
        var doc = await _documentRepository.GetByIdAsync(id);
        if (doc == null || doc.UserId != userId)
        {
            throw new NotFoundException($"Document with ID {id} was not found.");
        }

        var absolutePath = Path.Combine(_env.ContentRootPath, doc.FilePath);
        if (!File.Exists(absolutePath))
        {
            throw new NotFoundException("Physical file was not found on server.");
        }

        var contents = await File.ReadAllBytesAsync(absolutePath);
        return (contents, doc.ContentType, doc.OriginalFileName);
    }

    public async Task DeleteDocumentAsync(int id, int userId)
    {
        var doc = await _documentRepository.GetByIdAsync(id);
        if (doc == null || doc.UserId != userId)
        {
            throw new NotFoundException($"Document with ID {id} was not found.");
        }

        // 1. Delete from database
        await _documentRepository.DeleteAsync(doc);

        // 2. Delete physical file from filesystem
        var absolutePath = Path.Combine(_env.ContentRootPath, doc.FilePath);
        if (File.Exists(absolutePath))
        {
            try
            {
                File.Delete(absolutePath);
            }
            catch (Exception)
            {
                // Log and swallow file delete errors so DB transaction is not rolled back.
                // Or let exception bubble up. Swallowing is safer for document metadata consistency.
            }
        }
    }
}
