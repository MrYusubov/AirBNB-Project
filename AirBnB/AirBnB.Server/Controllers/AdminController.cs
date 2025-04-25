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

        public AdminController(AirBnbDbContext context)
        {
            _context = context;
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
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPatch("{id}/confirm")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> ConfirmHouse(int id)
        {
            var house = await _context.House.FindAsync(id);
            if (house == null)
            {
                return NotFound();
            }

            house.IsAvailable = true;
            await _context.SaveChangesAsync();

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
