using System.ComponentModel.DataAnnotations;

namespace AirBnB.Server.Models
{
    public class RegisterDto
    {
        [Required]
        public string? Username { get; set; }
        [Required]
        [DataType(DataType.Password)]
        public string? Password { get; set; }
        [Required]
        public string? Email { get; set; }
    }
}
