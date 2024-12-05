using MongoDB.Driver;
using MessagingService.Models;
using System.Threading.Tasks;

namespace MessagingService.Services
{
    public class MongoDbService
    {
        private readonly IMongoCollection<ChatRoom> _chatRooms;

        public MongoDbService()
        {
            var mongoClient = new MongoClient("mongodb+srv://ddmann2004:9kt1LQi62AMBcXDW@cluster0.gzmfmz9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
            var database = mongoClient.GetDatabase("Capstone");

            _chatRooms = database.GetCollection<ChatRoom>("ChatRooms");
        }

        // Add a new chat room
        public async Task<ChatRoom> CreateChatRoomAsync(string user1Id, string user2Id)
        {
            var chatRoom = new ChatRoom
            {
                Id = Guid.NewGuid().ToString(),
                User1Id = user1Id,
                User2Id = user2Id,
                Messages = new List<Message>(),
                Connections = new Dictionary<string, string>() // Stores connectionId as the key and userId as value
            };

            await _chatRooms.InsertOneAsync(chatRoom);
            return chatRoom;
        }

        // Retrieve a chat room by Id
        public async Task<ChatRoom> GetChatRoomByIdAsync(string chatRoomId)
        {
            var filter = Builders<ChatRoom>.Filter.Eq(c => c.Id, chatRoomId);
            return await _chatRooms.Find(filter).FirstOrDefaultAsync();
        }

        // Add a message to a chat room
        public async Task AddMessageToChatRoomAsync(string chatRoomId, Message message)
        {
            var filter = Builders<ChatRoom>.Filter.Eq(c => c.Id, chatRoomId);
            var update = Builders<ChatRoom>.Update.Push(c => c.Messages, message);
            await _chatRooms.UpdateOneAsync(filter, update);
        }

        // Add or update a user connection in a chat room
        public async Task AddConnectionToChatRoomAsync(string chatRoomId, string userId, string connectionId)
        {
            var filter = Builders<ChatRoom>.Filter.Eq(c => c.Id, chatRoomId);
            var update = Builders<ChatRoom>.Update.Set(c => c.Connections[userId], connectionId);
            await _chatRooms.UpdateOneAsync(filter, update);
        }

        // Remove a user connection from a chat room
        public async Task RemoveConnectionFromChatRoomAsync(string chatRoomId, string userId)
        {
            var filter = Builders<ChatRoom>.Filter.Eq(c => c.Id, chatRoomId);
            var update = Builders<ChatRoom>.Update.Unset(c => c.Connections[userId]);
            await _chatRooms.UpdateOneAsync(filter, update);
        }
    }
}
