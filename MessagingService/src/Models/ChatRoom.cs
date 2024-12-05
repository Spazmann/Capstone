namespace MessagingService.Models
{
    public class ChatRoom
    {
        public string Id { get; set; }
        public string User1Id { get; set; }
        public string User2Id { get; set; }
        public List<Message> Messages { get; set; } = new List<Message>();
    }
}
