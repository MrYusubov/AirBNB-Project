using AirBnB.Business.Abstract;
using AirBnB.Business.Concrete;
using AirBnB.DataAccess.Data;
using AirBnB.Entites.Concrete;
using AirBnB.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AirBnB.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AirBnbDbContext _context;
        private readonly IEmailService _emailService;

        public AdminController(AirBnbDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<House>>> GetAllHousesForAdmin()
        {
            var houses = await _context.House
                .OrderBy(h => h.IsAvailable)
                .ToListAsync();
            return Ok(houses);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteHouse(int id)
        {
            var house = await _context.House.FindAsync(id);
            if (house == null)
            {
                return NotFound();
            }

            _context.House.Remove(house);
            var notification = new Notification
            {
                ReceiverId = house.OwnerId,
                Title="Delete",
                Message="Your house deleted by admin."
            };
            await _context.Notifications.AddAsync(notification);
            await _context.SaveChangesAsync();
            if (house.Owner != null && !string.IsNullOrEmpty(house.Owner.Email))
            {
                await _emailService.SendEmailAsync(
                    house.Owner.Email,
                    "House Delete",
                    $"Hello, {house.Owner.UserName}, your home: {house.Title} is deleted by Admin!"
                );
            }
            else
            {
                return BadRequest();
            }
            return NoContent();
        }

        [HttpPatch("{id}/confirm")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> ConfirmHouse(int id)
        {
            var house = await _context.House.Include(h => h.Owner).FirstOrDefaultAsync(h => h.Id == id);
            if (house == null)
            {
                return NotFound();
            }

            house.IsAvailable = true;
            var notification = new Notification
            {
                ReceiverId = house.OwnerId,
                Title="Confirm",
                Message="Your house confirmed by admin."
            };
            await _context.Notifications.AddAsync(notification);
            await _context.SaveChangesAsync();
            if (house.Owner != null && !string.IsNullOrEmpty(house.Owner.Email))
            {
                await _emailService.SendEmailAsync(
                    house.Owner.Email,
                    "House Confirmation",
                    $"Hello, {house.Owner.UserName}, your home: {house.Title} is confirmed by Admin!"
                );
            }
            else
            {
                return BadRequest();
            }

            return NoContent();
        }


        [HttpPost("Category")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> CreateCategory([FromBody] CategoryDto model)
        {
            if (string.IsNullOrWhiteSpace(model.Name) || string.IsNullOrWhiteSpace(model.ImageUrl))
            {
                return BadRequest("Name and ImageUrl are required");
            }

            var category = new HouseCategory
            {
                Name = model.Name,
                ImageUrl = model.ImageUrl
            };

            _context.HouseCategory.Add(category);
            await _context.SaveChangesAsync();

            return Ok(category);
        }
    }
}
