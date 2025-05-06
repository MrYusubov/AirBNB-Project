using AirBnB.DataAccess.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AirBnB.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly AirBnbDbContext _context;

    public NotificationsController(AirBnbDbContext context)
    {
        _context = context;
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetNotifications(string userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.ReceiverId == userId)
            .ToListAsync();

        return Ok(notifications);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNotification(int id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification == null) return NotFound();

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("user/{userId}")]
    public async Task<IActionResult> DeleteAll(string userId)
    {
        var notifications = _context.Notifications.Where(n => n.ReceiverId == userId);
        _context.Notifications.RemoveRange(notifications);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
