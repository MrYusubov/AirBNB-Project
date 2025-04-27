namespace AirBnB.Server.Models;

public class BookingDto
{
    public int HouseId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalPrice { get; set; }
}
