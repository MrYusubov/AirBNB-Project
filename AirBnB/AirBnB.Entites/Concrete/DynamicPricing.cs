using System.ComponentModel.DataAnnotations;
namespace AirBnB.Entites.Concrete
{
    public class DynamicPricing
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int HouseId { get; set; }
        public House House { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public decimal Price { get; set; }
    }
}
