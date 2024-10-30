using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using MongoDB.Driver;
using MongoDB.Bson;
using System;
using Amazon.Runtime.Internal.Settings;
using MongoDB.Bson.Serialization.Conventions;
using HelloWorld.Models; 

public class PostDatabase
{
    const string connectionString = "mongodb+srv://ddmann2004:9kt1LQi62AMBcXDW@cluster0.gzmfmz9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    private static readonly MongoClient mongoClient = new MongoClient(connectionString);

    public static async Task<APIGatewayProxyResponse> AddPost(Post post)
    {
        var database = mongoClient.GetDatabase("Capstone");
        var collection = database.GetCollection<Post>("Posts");

        try
        {
            post.Id = Guid.NewGuid().ToString();

            await collection.InsertOneAsync(post);

            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(new { message = "Post created", post }),
                StatusCode = 201,
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
        catch (Exception e)
        {
            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(new { error = e.Message }),
                StatusCode = 500,
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
    }

    public static async Task<APIGatewayProxyResponse> EditPost(Post post, string id)
    {
        var database = mongoClient.GetDatabase("Capstone");
        var collection = database.GetCollection<Post>("Posts");

        var filter = Builders<Post>.Filter.Eq("_id", id);
        var update = Builders<Post>.Update
            .Set("Content", post.Content)
            .Set("Media", post.Media)
            .Set("ReplyId", post.ReplyId)
            .Set("CreatedAt", post.CreatedAt)
            .Set("Likes", post.Likes)
            .Set("CommentCount", post.CommentCount)
            .Set("RepostCount", post.RepostCount)
            .Set("BookmarkCount", post.BookmarkCount);
        try
        {
            var result = await collection.UpdateOneAsync(filter, update);

            if (result.MatchedCount == 0)
            {
                return new APIGatewayProxyResponse
                {
                    Body = JsonSerializer.Serialize(new { message = "Post not found" }),
                    StatusCode = 404,
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }

            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(new { message = "Post updated", post }),
                StatusCode = 200,
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
        catch (Exception e)
        {
            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(new { error = e.Message }),
                StatusCode = 500,
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
    }

    public static async Task<List<Post>> GetPostsAsync(int page, int pageSize)
    {
        var database = mongoClient.GetDatabase("Capstone");
        var collection = database.GetCollection<Post>("Posts");

        int skip = (page - 1) * pageSize;

        var filter = Builders<Post>.Filter.Empty; 
        var posts = await collection.Find(filter)
            .Sort(Builders<Post>.Sort.Descending("CreatedAt"))
            .Skip(skip)
            .Limit(pageSize)
            .ToListAsync();

        return posts;
    }

    public static async Task<Post> GetPostById(string id)
    {
        var database = mongoClient.GetDatabase("Capstone");
        var collection = database.GetCollection<Post>("Posts");
        var filter = Builders<Post>.Filter.Eq("_id", id);

        try
        {
            Post post = await collection.Find(filter).FirstOrDefaultAsync();
            return post;
        }
        catch (Exception e)
        {
            LambdaLogger.Log($"Error in GetPostById: {e.Message}");
            throw;
        }
    }

}
