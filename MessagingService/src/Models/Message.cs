namespace MessagingService.Models
{
    public class Message
    {
        public string Id { get; set; }
        public string SendingUserId { get; set; }
        public string Content { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
