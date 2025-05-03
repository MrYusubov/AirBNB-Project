using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace AirBnB.Entites.Concrete
{
    public class CustomIdentityUser:IdentityUser
    {
        [Url]
        public string? ProfilePicture { get; set; }
        public bool IsOnline { get; set; }
        public string? EmailConfirmationToken { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<House> Houses { get; set; } = new List<House>();
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}
