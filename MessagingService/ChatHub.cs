using Microsoft.AspNetCore.SignalR;
using MessagingBackend.Models;
using MessagingBackend.Services;
using System;
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
            if (string.IsNullOrEmpty(chatRoomId) || string.IsNullOrEmpty(senderId) || string.IsNullOrEmpty(content))
            {
                throw new ArgumentException("ChatRoomId, SenderId, and Content cannot be null or empty.");
            }

            try
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
            catch (Exception ex)
            {
                // Log the error (replace with your logging mechanism)
                Console.WriteLine($"Error in SendMessage: {ex.Message}");
                throw new HubException("An error occurred while sending the message.");
            }
        }

        public async Task JoinChatRoom(string chatRoomId)
        {
            if (string.IsNullOrEmpty(chatRoomId))
            {
                throw new ArgumentException("ChatRoomId cannot be null or empty.");
            }

            try
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, chatRoomId);
                Console.WriteLine($"Connection {Context.ConnectionId} joined chat room {chatRoomId}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in JoinChatRoom: {ex.Message}");
                throw new HubException("An error occurred while joining the chat room.");
            }
        }

        public async Task LeaveChatRoom(string chatRoomId)
        {
            if (string.IsNullOrEmpty(chatRoomId))
            {
                throw new ArgumentException("ChatRoomId cannot be null or empty.");
            }

            try
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatRoomId);
                Console.WriteLine($"Connection {Context.ConnectionId} left chat room {chatRoomId}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in LeaveChatRoom: {ex.Message}");
                throw new HubException("An error occurred while leaving the chat room.");
            }
        }

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"New connection established: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            Console.WriteLine($"Connection closed: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }
    }
}
