using AirBnB.Business.Abstract;
using AirBnB.DataAccess.Data;
using AirBnB.Entites.Concrete;
using AirBnB.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace AirBnB.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class HousesController : ControllerBase
    {
        private readonly AirBnbDbContext _context;
        private readonly ICloudinaryService _cloudinaryService;

        public HousesController(AirBnbDbContext context, ICloudinaryService cloudinaryService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<House>>> GetHouses()
        {
            var houses = await _context.House
                .Include(h => h.Reviews)
                .ToListAsync();
            
            foreach (var house in houses)
            {
                if (house.Reviews != null && house.Reviews.Any())
                {
                    house.Rating = house.Reviews.Average(r => r.Stars);
                }
                else
                {
                    house.Rating = 0;
                }
            }
    
            return Ok(houses);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<House>> GetHouse(int id)
        {
            var house = await _context.House
                .Include(h => h.Reviews)
                .FirstOrDefaultAsync(h => h.Id == id);
        
            var users = await _context.Users.ToListAsync();
            var user = users.FirstOrDefault(x => x.Id == house.OwnerId);
            house.Owner = user;

            if (house == null)
            {
                return NotFound();
            }

            if (house.Reviews != null && house.Reviews.Any())
            {
                house.Rating = house.Reviews.Average(r => r.Stars);
            }
            else
            {
                house.Rating = 0;
            }

            return house;
        }

        [HttpGet("{id}/reviews")]
        public async Task<ActionResult<IEnumerable<Review>>> GetHouseReviews(int id)
        {
            var reviews = await _context.Review
                .Where(h => h.HouseId == id)
                .ToListAsync();
            var users = await _context.Users.ToListAsync();
            foreach (var review in reviews)
            {
                review.User = users.FirstOrDefault(x => x.Id == review.UserId);
            }
            return reviews;
        }

        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<HouseCategory>>> GetCategories()
        {
            return await _context.HouseCategory.ToListAsync();
        }

        [HttpGet("available")]
        public async Task<ActionResult<IEnumerable<House>>> GetAvailableHouses()
        {
            var houses = await _context.House
                .Where(h => h.IsAvailable)
                .ToListAsync();
            return Ok(houses);
        }

        [HttpPost]
        public async Task<ActionResult<House>> PostHouse([FromBody] HouseCreateDto houseDto)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var house = new House
            {
                Title = houseDto.Title,
                Description = houseDto.Description,
                PricePerNight = houseDto.PricePerNight,
                Location = houseDto.Location,
                Adress = houseDto.Adress,
                OwnerId=ownerId,
                RoomCount = houseDto.RoomCount,
                CategoryId = houseDto.CategoryId,
                ImageUrl = houseDto.ImageUrls,
                Latitude = houseDto.Latitude,
                Longitude = houseDto.Longitude,
                IsAvailable=false,
            };
            _context.House.Add(house);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetHouse", new { id = house.Id }, house);
        }

        [HttpGet("GetMultiple")]
        public async Task<ActionResult<IEnumerable<House>>> GetMultipleHouses([FromQuery] string ids)
        {
            if (string.IsNullOrWhiteSpace(ids))
            {
                return BadRequest("House IDs are required");
            }

            var idList = ids.Split(',').Select(int.Parse).ToList();

            var houses = await _context.House
                .Where(h => idList.Contains(h.Id))
                .ToListAsync();

            return Ok(houses);
        }

        [HttpGet("Search")]
        public async Task<ActionResult<IEnumerable<House>>> SearchHouses([FromQuery] string location)
        {
            if (string.IsNullOrWhiteSpace(location))
            {
                return BadRequest("Location is required");
            }

            var loweredQuery = location.ToLower();

            var houses = await _context.House
                .Where(h =>
                    h.Location.ToLower().Contains(loweredQuery) ||
                    h.Adress.ToLower().Contains(loweredQuery))
                .ToListAsync();

            return Ok(houses);
        }

        
        [HttpGet("UserHouses/{userId}")]
        public async Task<ActionResult<IEnumerable<House>>> GetUserHouses(string userId)
        {
            var houses = await _context.House
                .Where(h => h.OwnerId == userId)
                .ToListAsync();

            if (houses == null || houses.Count == 0)
            {
                return NotFound("Could not find house");
            }

            return Ok(houses);
        }
        
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteHouse(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    
            var house = await _context.House
                .Include(h => h.Bookings)
                .Include(h => h.Reviews)
                .FirstOrDefaultAsync(h => h.Id == id);
    
            if (house == null) 
                return NotFound();
    
            if (house.OwnerId != userId && !User.IsInRole("Admin")) 
                return Forbid();
    
            if (house.Bookings?.Any() == true)
            {
                _context.Booking.RemoveRange(house.Bookings);
            }
    
            if (house.Reviews?.Any() == true)
            {
                _context.Review.RemoveRange(house.Reviews);
            }
    
            _context.House.Remove(house);
    
            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"Error deleting house: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
        
                return StatusCode(500, "An Error occured while deleting house");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Unexpected error: {ex.Message}");
                return StatusCode(500, "Erroor occured while deleting house");
            }
        }
        
        [HttpPatch("{id}/UpdatePrice")]
        public async Task<ActionResult> UpdatePrice(int id, [FromBody] PriceUpdateDto dto)
        {
            var house = await _context.House.FindAsync(id);
            if (house == null) return NotFound();

            house.PricePerNight = dto.NewPrice;
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}
