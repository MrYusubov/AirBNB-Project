using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;

namespace AirBnB.Entites.Concrete
{
    public class Review
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }
        public CustomIdentityUser User { get; set; }

        [Required]
        public int HouseId { get; set; }
        public House House { get; set; }

        [Required, MaxLength(1000)]
        public string Comment { get; set; }

        [Required, Range(1, 5)]
        public int Stars { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
