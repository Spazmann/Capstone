using MessagingBackend.Models;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MessagingBackend.Services
{
    public class MongoDbService
    {
        private readonly IMongoCollection<Message> _messages;

        public MongoDbService()
        {
            const string connectionString = "mongodb+srv://ddmann2004:9kt1LQi62AMBcXDW@cluster0.gzmfmz9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
            var mongoClient = new MongoClient(connectionString);
            var database = mongoClient.GetDatabase("Capstone");

            _messages = database.GetCollection<Message>("Messages");
        }

        public async Task SaveMessage(Message message)
        {
            await _messages.InsertOneAsync(message);
        }

        public async Task<List<Message>> GetMessages(string senderId, string receiverId)
        {
            return await _messages.Find(m =>
                (m.SenderId == senderId && m.ReceiverId == receiverId) ||
                (m.SenderId == receiverId && m.ReceiverId == senderId))
                .SortBy(m => m.Timestamp) 
                .ToListAsync();
        }
    }
}
