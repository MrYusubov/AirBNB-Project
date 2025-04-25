using System.ComponentModel.DataAnnotations;

namespace AirBnB.Server.Models
{
    public class LoginDto
    {
        [Required]
        public string? Username { get; set; }
        [Required]
        [DataType(DataType.Password)]
        public string? Password { get; set; }
        public bool RememberMe { get; set; }
    }
}
