namespace AirBnB.Entites.Concrete
{
    public class Message
    {
        public int Id { get; set; }
        public string SenderId { get; set; }
        public string ReceiverId { get; set; }
        public string Content { get; set; }
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;

        public CustomIdentityUser Sender { get; set; }
        public CustomIdentityUser Receiver { get; set; }
    }

}
