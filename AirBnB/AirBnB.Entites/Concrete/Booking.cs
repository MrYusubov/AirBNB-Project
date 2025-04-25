using System.ComponentModel.DataAnnotations;

namespace AirBnB.Entites.Concrete
{
    public class Booking
    {
        public int Id { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalPrice { get; set; }
        public int HouseId { get; set; }
        public House House { get; set; }
        [Required]
        public string GuestId { get; set; }
        [Required]
        public CustomIdentityUser Guest { get; set; }

        public bool IsConfirmed { get; set; } = false;
    }
}
