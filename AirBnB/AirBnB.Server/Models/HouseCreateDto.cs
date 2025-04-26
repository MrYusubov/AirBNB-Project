using System.ComponentModel.DataAnnotations;

namespace AirBnB.Server.Models
{
    public class HouseCreateDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal PricePerNight { get; set; }
        [Required]
        public string OwnerId { get; set; }
        public string Location { get; set; }
        public string Adress { get; set; }
        public int RoomCount { get; set; }
        public int CategoryId { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public List<string> ImageUrls { get; set; } = new List<string>();
    }

}
