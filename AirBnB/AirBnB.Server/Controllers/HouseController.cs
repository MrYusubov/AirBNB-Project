using AirBnB.Business.Abstract;
using AirBnB.DataAccess.Data;
using AirBnB.Entites.Concrete;
using AirBnB.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

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
            var houses = await _context.House.ToListAsync();
            return Ok(houses);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<House>> GetHouse(int id)
        {
            var house = await _context.House.FindAsync(id);
            var users= await _context.Users.ToListAsync();
            var user = users.FirstOrDefault(x => x.Id == house.OwnerId);
            house.Owner = user;

            if (house == null)
            {
                return NotFound();
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

            var houses = await _context.House
                .Where(h => h.Location.ToLower().Contains(location.ToLower()))
                .ToListAsync();

            return Ok(houses);
        }
    }
}
