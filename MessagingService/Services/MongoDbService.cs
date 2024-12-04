using MessagingBackend.Models;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MessagingBackend.Services
{
    public class MongoDbService
    {
        private readonly IMongoCollection<ChatRoom> _chatRooms;

        public MongoDbService()
        {
            const string connectionString = "mongodb+srv://ddmann2004:9kt1LQi62AMBcXDW@cluster0.gzmfmz9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
            var mongoClient = new MongoClient(connectionString);
            var database = mongoClient.GetDatabase("Capstone");

            _chatRooms = database.GetCollection<ChatRoom>("Messages");
        }

        public async Task<List<ChatRoom>> GetAllChatRoomsAsync()
        {
            return await _chatRooms.Find(_ => true).ToListAsync();
        }

        public async Task<ChatRoom> GetChatRoomByIdAsync(string id)
        {
            return await _chatRooms.Find(cr => cr.Id == id).FirstOrDefaultAsync();
        }

        public async Task CreateChatRoomAsync(ChatRoom chatRoom)
        {
            await _chatRooms.InsertOneAsync(chatRoom);
        }

        public async Task AddMessageToChatRoomAsync(string chatRoomId, Message message)
        {
            var update = Builders<ChatRoom>.Update.Push(cr => cr.Messages, message);
            await _chatRooms.UpdateOneAsync(cr => cr.Id == chatRoomId, update);
        }
    }
}
