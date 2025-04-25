using AirBnB.DataAccess.Data;
using AirBnB.Entites.Concrete;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AirBnB.Server.Models;

namespace AirBnB.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MessageController : ControllerBase
    {
        private readonly ILogger<MessageController> _logger;
        private readonly AirBnbDbContext _context;
        private readonly UserManager<CustomIdentityUser> _userManager;

        public MessageController(ILogger<MessageController> logger, AirBnbDbContext context, UserManager<CustomIdentityUser> userManager)
        {
            _logger = logger;
            _context = context;
            _userManager = userManager;
        }

        [HttpPost(Name = "AddMessage")]
        public async Task<ActionResult> AddMessage(MessageModel model)
        {
            var message = new Message
            {
                SenderId = model.SenderId,
                ReceiverId = model.ReceiverId,
                Content = model.Content,
                SentAt = DateTime.Now,
                IsRead = false
            };

            await _context.Message.AddAsync(message);
            await _context.SaveChangesAsync();

            return Ok(message);
        }

        [HttpGet("GetAllMessages/{receiverId}/{senderId}")]
        public async Task<ActionResult> GetAllMessages(string receiverId, string senderId)
        {
            var messages = await _context.Message
                .Where(m => (m.SenderId == senderId && m.ReceiverId == receiverId) ||
                            (m.SenderId == receiverId && m.ReceiverId == senderId))
                .OrderBy(m => m.SentAt)
                .ToListAsync();

            return Ok(messages);
        }

        [HttpGet("GetChatUsers/{userId}")]
        public async Task<ActionResult> GetChatUsers(string userId)
        {
            var userIds = await _context.Message
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .Select(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
                .Distinct()
                .ToListAsync();

            var users = await _userManager.Users
                .Where(u => userIds.Contains(u.Id))
                .Select(u => new
                {
                    u.Id,
                    u.UserName,
                    u.ProfilePicture,
                    u.IsOnline
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("GetAllUsers")]
        public async Task<ActionResult> GetAllUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            return Ok(users);
        }



    }
}
