namespace AirBnB.Server.Models;

public class ReviewDto
{
    public int HouseId { get; set; }
    public string UserId { get; set; }
    public string Comment { get; set; }
    public int Rating { get; set; }
}