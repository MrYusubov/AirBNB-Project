using AirBnB.DataAccess.Data;
using AirBnB.Entites.Concrete;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AirBnB.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : Controller
    {
        private readonly AirBnbDbContext _context;

        public CategoryController(AirBnbDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<HouseCategory>>> GetCategories()
        {
            var categories = await _context.HouseCategory.ToListAsync();
            return Ok(categories);
        }
    }
}
