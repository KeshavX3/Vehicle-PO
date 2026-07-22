using Microsoft.AspNetCore.Mvc;
using VehicleIQ.API.DTOs;
using VehicleIQ.API.Services.Interfaces;

namespace VehicleIQ.API.Controllers;

public class PucCertificatesController : BaseApiController
{
    private readonly IPucCertificateService _pucCertificateService;

    public PucCertificatesController(IPucCertificateService pucCertificateService)
    {
        _pucCertificateService = pucCertificateService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PucCertificateDto>>> GetAllPucs()
    {
        var pucs = await _pucCertificateService.GetPucsByUserIdAsync(CurrentUserId);
        return Ok(pucs);
    }

    [HttpGet("vehicle/{vehicleId}")]
    public async Task<ActionResult<IReadOnlyList<PucCertificateDto>>> GetPucs(int vehicleId)
    {
        var pucs = await _pucCertificateService.GetPucsByVehicleIdAsync(vehicleId, CurrentUserId);
        return Ok(pucs);
    }

    [HttpPost]
    public async Task<ActionResult<PucCertificateDto>> CreatePucCertificate([FromBody] CreatePucCertificateRequest request)
    {
        var created = await _pucCertificateService.CreatePucCertificateAsync(request, CurrentUserId);
        return CreatedAtAction(null, created);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePucCertificate(int id)
    {
        await _pucCertificateService.DeletePucCertificateAsync(id, CurrentUserId);
        return NoContent();
    }
}
