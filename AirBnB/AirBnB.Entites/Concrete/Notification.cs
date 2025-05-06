namespace AirBnB.Entites.Concrete;

public class Notification
{
    public int Id { get; set; }
    public string ReceiverId { get; set; }
    public string Title { get; set; }
    public string Message { get; set; }
}