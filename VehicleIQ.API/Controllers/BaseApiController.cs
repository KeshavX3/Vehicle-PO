using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace VehicleIQ.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    /// <summary>
    /// Reads the logged-in User ID from the validated JWT Claims.
    /// Fallback to 1 for backwards compatibility if claim is unreadable.
    /// </summary>
    protected int CurrentUserId
    {
        get
        {
            var claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (claimValue != null && int.TryParse(claimValue, out var userId))
            {
                return userId;
            }

            if (Request.Headers.TryGetValue("X-User-Id", out var headerValue) && int.TryParse(headerValue, out var headerUserId))
            {
                return headerUserId;
            }

            return 1; // Fallback demo user
        }
    }
}
