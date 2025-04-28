using AirBnB.DataAccess.Data;
using AirBnB.Entites.Concrete;
using AirBnB.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AirBnB.Server.Controllers;
[Route("api/[controller]")]
[ApiController]
public class ReviewController : ControllerBase
{
    private readonly AirBnbDbContext _context;

    public ReviewController(AirBnbDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> PostReview([FromBody] ReviewDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var review = new Review
        {
            HouseId = model.HouseId,
            UserId = model.UserId,
            Comment = model.Comment,
            Stars = model.Rating,
            CreatedAt = DateTime.UtcNow
        };

        _context.Review.Add(review);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Review created successfully" });
    }

    [HttpGet("{houseId}")]
    public async Task<IActionResult> GetReviewsForHouse(int houseId)
    {
        var reviews = await _context.Review
            .Where(r => r.HouseId == houseId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(reviews);
    }
}