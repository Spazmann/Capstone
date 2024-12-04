using Microsoft.AspNetCore.SignalR;
using MessagingBackend.Models;
using MessagingBackend.Services;
using System.Threading.Tasks;

namespace MessagingBackend
{
    public class ChatHub : Hub
    {
        private readonly MongoDbService _mongoDbService;

        public ChatHub(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        public async Task SendMessage(string chatRoomId, string senderId, string content)
        {
            var message = new Message
            {
                Id = Guid.NewGuid().ToString(),
                SenderId = senderId,
                Content = content,
                Timestamp = DateTime.UtcNow
            };

            // Save the message to MongoDB
            await _mongoDbService.AddMessageToChatRoomAsync(chatRoomId, message);

            // Broadcast the message to all clients in the chat room
            await Clients.Group(chatRoomId).SendAsync("ReceiveMessage", message);
        }

        public async Task JoinChatRoom(string chatRoomId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, chatRoomId);
        }

        public async Task LeaveChatRoom(string chatRoomId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatRoomId);
        }
    }
}
