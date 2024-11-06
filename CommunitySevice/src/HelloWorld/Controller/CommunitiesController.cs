using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Driver;
using MongoDB.Bson;
using HelloWorld.Models;

public class CommunitiesDatabase
{
    const string connectionString = "mongodb+srv://ddmann2004:9kt1LQi62AMBcXDW@cluster0.gzmfmz9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    private static readonly MongoClient mongoClient = new MongoClient(connectionString);

    private static IMongoCollection<Post> GetCollection()
    {
        var database = mongoClient.GetDatabase("Capstone");
        return database.GetCollection<Post>("Communities");
    }

    public static async Task<Post> CreateCommunity(string communityName, string userId)
    {
        var collection = GetCollection();
        var newCommunity = new Post
        {
            Id = ObjectId.GenerateNewId().ToString(),
            communityName = communityName,
            admins = new List<string> { userId },
            mods = new List<string>(),
            members = new List<string> { userId }
        };

        await collection.InsertOneAsync(newCommunity);
        return newCommunity;
    }

    public static async Task<bool> EditCommunityName(string communityId, string newName)
    {
        var collection = GetCollection();
        var filter = Builders<Post>.Filter.Eq(c => c.Id, communityId);
        var update = Builders<Post>.Update.Set(c => c.communityName, newName);

        var result = await collection.UpdateOneAsync(filter, update);
        return result.ModifiedCount > 0;
    }

    public static async Task<bool> EditAdmins(string communityId, string userId, bool add)
    {
        var collection = GetCollection();
        var filter = Builders<Post>.Filter.Eq(c => c.Id, communityId);
        var update = add
            ? Builders<Post>.Update.AddToSet(c => c.admins, userId)
            : Builders<Post>.Update.Pull(c => c.admins, userId);

        var result = await collection.UpdateOneAsync(filter, update);
        return result.ModifiedCount > 0;
    }

    public static async Task<bool> EditMods(string communityId, string userId, bool add)
    {
        var collection = GetCollection();
        var filter = Builders<Post>.Filter.Eq(c => c.Id, communityId);
        var update = add
            ? Builders<Post>.Update.AddToSet(c => c.mods, userId)
            : Builders<Post>.Update.Pull(c => c.mods, userId);

        var result = await collection.UpdateOneAsync(filter, update);
        return result.ModifiedCount > 0;
    }

    public static async Task<bool> EditMembers(string communityId, string userId, bool add)
    {
        var collection = GetCollection();
        var filter = Builders<Post>.Filter.Eq(c => c.Id, communityId);
        var update = add
            ? Builders<Post>.Update.AddToSet(c => c.members, userId)
            : Builders<Post>.Update.Pull(c => c.members, userId);

        var result = await collection.UpdateOneAsync(filter, update);
        return result.ModifiedCount > 0;
    }
}
