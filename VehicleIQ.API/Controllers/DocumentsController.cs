using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VehicleIQ.API.DTOs;
using VehicleIQ.API.Models.Enums;
using VehicleIQ.API.Services.Interfaces;

namespace VehicleIQ.API.Controllers;

public class DocumentsController : BaseApiController
{
    private readonly IDocumentService _documentService;

    public DocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<DocumentDto>>> GetDocuments()
    {
        var docs = await _documentService.GetDocumentsByUserIdAsync(CurrentUserId);
        return Ok(docs);
    }

    [HttpGet("vehicle/{vehicleId}")]
    public async Task<ActionResult<IReadOnlyList<DocumentDto>>> GetDocumentsByVehicle(int vehicleId)
    {
        var docs = await _documentService.GetDocumentsByVehicleIdAsync(vehicleId, CurrentUserId);
        return Ok(docs);
    }

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<DocumentDto>> UploadDocument(
        [FromForm] int? vehicleId,
        [FromForm] DocumentType documentType,
        IFormFile file,
        [FromForm] string? referenceType = null,
        [FromForm] int? referenceId = null)
    {
        var created = await _documentService.UploadDocumentAsync(
            CurrentUserId, 
            vehicleId, 
            documentType, 
            file, 
            referenceType, 
            referenceId
        );
        return CreatedAtAction(null, created);
    }

    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadDocument(int id)
    {
        var (fileContents, contentType, originalFileName) = await _documentService.GetDocumentFileAsync(id, CurrentUserId);
        return File(fileContents, contentType, originalFileName);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDocument(int id)
    {
        await _documentService.DeleteDocumentAsync(id, CurrentUserId);
        return NoContent();
    }
}
