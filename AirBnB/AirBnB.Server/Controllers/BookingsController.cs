using AirBnB.DataAccess.Data;
using AirBnB.Entites.Concrete;
using AirBnB.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AirBnB.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly AirBnbDbContext _context;
    private readonly UserManager<CustomIdentityUser> _userManager;

    public BookingsController(AirBnbDbContext context, UserManager<CustomIdentityUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] BookingDto bookingDto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        var booking = new Booking
        {
            HouseId = bookingDto.HouseId,
            StartDate = bookingDto.StartDate,
            EndDate = bookingDto.EndDate,
            TotalPrice = bookingDto.TotalPrice,
            GuestId = user.Id,
            IsConfirmed = true
        };

        _context.Booking.Add(booking);
        await _context.SaveChangesAsync();

        return Ok(booking);
    }
    
    [HttpGet("reserved-dates/{houseId}")]
    public IActionResult GetReservedDates(int houseId)
    {
        var bookings = _context.Booking
            .Where(b => b.HouseId == houseId)
            .Select(b => new { b.StartDate, b.EndDate })
            .ToList();

        return Ok(bookings);
    }

}