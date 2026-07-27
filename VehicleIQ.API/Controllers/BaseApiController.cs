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
    /// Throws UnauthorizedAccessException if the claim is missing or unparseable.
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

            throw new UnauthorizedAccessException("User identity could not be determined from the JWT token.");
        }
    }
}
