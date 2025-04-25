using System.ComponentModel.DataAnnotations;

namespace AirBnB.Entites.Concrete
{
    public class HouseCategory
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(50)]
        public string Name { get; set; }
        [Url]
        public string ImageUrl { get; set; }

        public ICollection<House> Houses { get; set; } = new List<House>();
    }
}
