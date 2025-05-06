using AirBnB.Business.Abstract;
using AirBnB.DataAccess.Data;
using AirBnB.Entites.Concrete;
using AirBnB.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AirBnB.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly AirBnbDbContext _context;
    private readonly UserManager<CustomIdentityUser> _userManager;
    private readonly IEmailService _emailService;

    public BookingsController(AirBnbDbContext context, UserManager<CustomIdentityUser> userManager, IEmailService emailService)
    {
        _context = context;
        _userManager = userManager;
        _emailService = emailService;
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
            IsConfirmed = false
        };

        _context.Booking.Add(booking);
        var house=await _context.House.Include(h=>h.Owner).FirstOrDefaultAsync(h => h.Id == booking.HouseId);
        var notification = new Notification
        {
            ReceiverId = house.OwnerId,
            Title="Booking",
            Message="You have new customer.Please check that.Have a good day :)"
        };
        await _context.Notifications.AddAsync(notification);
        await _context.SaveChangesAsync();
        if (house.Owner != null && !string.IsNullOrEmpty(house.Owner.Email))
        {
            await _emailService.SendEmailAsync(
                house.Owner.Email,
                "New Reservation",
                $"Hello, {house.Owner.UserName}, you've new reservation,please check that.Have a good day :)"
            );
        }
        else
        {
            return BadRequest();
        }
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
    
    [HttpGet("UserBookings/{guestId}")]
    public async Task<IActionResult> GetUserBookings(string guestId)
    {
        if (string.IsNullOrEmpty(guestId))
            return BadRequest("Guest ID is required.");

        var bookings = await _context.Booking
            .Include(b => b.House)
            .Where(b => b.GuestId == guestId)
            .ToListAsync();

        return Ok(bookings);
    }
    
    
    [HttpGet("SellerBookings/{sellerId}")]
    public async Task<ActionResult<IEnumerable<Booking>>> GetSellerBookings(string sellerId)
    {
        var bookings = await _context.Booking
            .Include(b => b.House)
            .Include(b => b.Guest)
            .Where(b => b.House.OwnerId == sellerId)
            .ToListAsync();

        if (bookings == null)
        {
            return NotFound();
        }

        return bookings;
    }

    [HttpPatch("Confirm/{bookingId}")]
    public async Task<IActionResult> ConfirmBooking(int bookingId)
    {
        var booking = await _context.Booking
            .Include(b => b.House)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null)
        {
            return NotFound();
        }

        booking.IsConfirmed = true;
        var notification = new Notification
        {
            ReceiverId = booking.GuestId,
            Title="Reservation Confirm",
            Message="Your Reservation confirmed by host."
        };
        await _context.Notifications.AddAsync(notification);
        await _context.SaveChangesAsync();
        
        var owner = await _userManager.FindByIdAsync(booking.GuestId.ToString());
        
        await _emailService.SendEmailAsync(
            owner.Email,
            "Reservation Confirm",
            $"Hello, {owner.UserName}, your reservation confirmed by host."
        );

        return NoContent();
    }

    [HttpDelete("Delete/{bookingId}")]
    public async Task<IActionResult> DeleteBooking(int bookingId)
    {
        var booking = await _context.Booking
            .Include(b => b.House)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null)
        {
            return NotFound();
        }

        _context.Booking.Remove(booking);
        
        var notification = new Notification
        {
            ReceiverId = booking.GuestId,
            Title="Reservation Decline",
            Message="Your Reservation declined by host."
        };
        await _context.Notifications.AddAsync(notification);
        await _context.SaveChangesAsync();
        
        var owner = await _userManager.FindByIdAsync(booking.GuestId.ToString());
        
        await _emailService.SendEmailAsync(
            owner.Email,
            "Reservation decline",
            $"Hello, {owner.UserName}, your reservation declined by host."
        );

        return NoContent();
    }


}