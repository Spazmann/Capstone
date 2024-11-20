using MessagingBackend.Services; 
using MessagingBackend.Models; 
using Microsoft.AspNetCore.SignalR;

namespace MessagingBackend
{
    public class ChatHub : Hub
    {
        private readonly MongoDbService _mongoDbService;

        public ChatHub(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        public async Task SendMessage(string senderId, string receiverId, string content)
        {
            var message = new Message
            {
                Id = Guid.NewGuid().ToString(),
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = content,
                Timestamp = DateTime.UtcNow
            };

            await _mongoDbService.SaveMessage(message);

            await Clients.User(receiverId).SendAsync("ReceiveMessage", senderId, content);
        }
    }
}
