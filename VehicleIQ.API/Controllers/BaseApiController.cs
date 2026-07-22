using Microsoft.AspNetCore.Mvc;

namespace VehicleIQ.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    /// <summary>
    /// Helper property to retrieve the current request's user ID.
    /// In Phase 3/4, falls back to the seeded user ID 1 if X-User-Id header is absent.
    /// In Phase 5, this will read from the JWT Bearer token claims.
    /// </summary>
    protected int CurrentUserId
    {
        get
        {
            if (Request.Headers.TryGetValue("X-User-Id", out var value) && int.TryParse(value, out var userId))
            {
                return userId;
            }
            return 1; // Seeded Demo User
        }
    }
}
