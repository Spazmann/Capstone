namespace MessagingBackend.Models
{
    public class ChatRoom
    {
        public string Id { get; set; }
        public string SenderId { get; set; }
        public string ReceiverId { get; set; }
        public List<Message> Messages { get; set; } = new List<Message>();
    }
}
