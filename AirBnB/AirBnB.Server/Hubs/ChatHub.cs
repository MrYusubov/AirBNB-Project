using AirBnB.DataAccess.Data;
using AirBnB.Entites.Concrete;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace AirBnB.Server.Hubs
{
    public class ChatHub : Hub
    {
        private readonly UserManager<CustomIdentityUser> _userManager;
        private readonly AirBnbDbContext _context;

        public ChatHub(UserManager<CustomIdentityUser> userManager, AirBnbDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            if (userId != null)
            {
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    user.IsOnline = true;
                    await _context.SaveChangesAsync();
                    await Clients.All.SendAsync("UpdateUserStatus", user.Id, true);
                }
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier;
            if (userId != null)
            {
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    user.IsOnline = false;
                    await _context.SaveChangesAsync();
                    await Clients.All.SendAsync("UpdateUserStatus", user.Id, false);
                }
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(string receiverId, string content)
        {
            var senderId = Context.UserIdentifier;

            var newMessage = new Message
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = content,
                SentAt = DateTime.UtcNow.AddHours(4),
                IsRead = false
            };

            _context.Message.Add(newMessage);
            await _context.SaveChangesAsync();

            var messageDto = new
            {
                id = newMessage.Id,
                senderId = senderId,
                receiverId = receiverId,
                content = content,
                sentAt = newMessage.SentAt.ToString("dd.MM.yyyy HH:mm"),
                isRead = false
            };

            await Clients.User(receiverId).SendAsync("ReceiveMessage", messageDto);
        }

        public async Task MarkAsRead(string messageId)
        {
            var message = await _context.Message.FindAsync(Guid.Parse(messageId));
            if (message != null)
            {
                message.IsRead = true;
                await _context.SaveChangesAsync();
            }
        }
    }
}
