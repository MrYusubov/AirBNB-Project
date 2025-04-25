using AirBnB.DataAccess.Data;
using AirBnB.Entites.Concrete;
using AirBnB.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AirBnB.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FavoriteController : Controller
    {
        private readonly AirBnbDbContext _context;

        public FavoriteController(AirBnbDbContext context)
        {
            _context = context;
        }

        [HttpPost("Add")]
        public async Task<ActionResult> AddFavorite([FromBody] FavoriteDto model)
        {
            if (string.IsNullOrWhiteSpace(model.UserId) || model.HouseId==null)
            {
                return BadRequest("UserId and HouseId are required");
            }

            var favorite = new Favorite
            {
                UserId = model.UserId,
                HouseId = model.HouseId
            };

            _context.Favorite.Add(favorite);
            await _context.SaveChangesAsync();

            return Ok(favorite);
        }

        [HttpDelete("Remove")]
        public async Task<ActionResult> RemoveFavorite([FromQuery] string userId, [FromQuery] string houseId)
        {
            if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(houseId))
            {
                return BadRequest("UserId and HouseId are required");
            }

            var favorite = await _context.Favorite
                .FirstOrDefaultAsync(f => f.UserId == userId && f.HouseId == Convert.ToInt32(houseId));

            if (favorite == null)
            {
                return NotFound("Favorite not found");
            }

            _context.Favorite.Remove(favorite);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Favorite removed successfully" });
        }

        [HttpGet("Check")]
        public async Task<ActionResult> CheckFavoriteStatus([FromQuery] string userId, [FromQuery] string houseId)
        {
            if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(houseId))
            {
                return BadRequest("UserId and HouseId are required");
            }

            var isFavorite = await _context.Favorite
                .AnyAsync(f => f.UserId == userId && f.HouseId == Convert.ToInt32(houseId));

            return Ok(new { isFavorite });
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Favorite>>> GetAllFavorites([FromQuery] string userId)
        {
            var favorites = await _context.Favorite
                .Where(f => f.UserId == userId)
                .ToListAsync();
            return Ok(favorites);
        }


    }
}
