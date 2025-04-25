using System.ComponentModel.DataAnnotations;

namespace AirBnB.Entites.Concrete
{
    public class Favorite
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }
        [Required]
        public int HouseId { get; set; }
        public virtual CustomIdentityUser User { get; set; }
        public virtual House House { get; set; }
    }
}
