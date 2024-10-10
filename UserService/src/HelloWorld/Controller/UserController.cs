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

public class UserDatabase
{
    const string connectionString = "mongodb+srv://ddmann2004:9kt1LQi62AMBcXDW@cluster0.gzmfmz9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Added semicolon

    public static async Task<APIGatewayProxyResponse> AddUserToDatabase(User user)
    {
        var mongoClient = new MongoClient(connectionString);
        var database = mongoClient.GetDatabase("Capstone");
        var collection = database.GetCollection<User>("Users");
        
        User user1 = await FindUserByEmail(user.Email);
        if (user1 != null)
        {
            if (user.Email == user1.Email)
            {
                return new APIGatewayProxyResponse
                {
                    Body = JsonSerializer.Serialize(new { message = $"User With Email {user1.Email} already exists" }),
                    StatusCode = 500,
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }
        }
        
        User user2 = await FindUserByUsername(user.Username);
        if (user2 != null)
        {
            if (user.Username == user2.Username)
            {
                return new APIGatewayProxyResponse
                {
                    Body = JsonSerializer.Serialize(new { message = $"User With Username {user2.Username} already exists" }),
                    StatusCode = 500,
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }
        }
        
        user.Id = Guid.NewGuid().ToString();
        await collection.InsertOneAsync(user);
        return new APIGatewayProxyResponse
        {
            Body = JsonSerializer.Serialize(new { message = user }),
            StatusCode = 200,
            Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
        };
    }

    public static async Task<APIGatewayProxyResponse> EditUser(User user, string email)
    {
        var mongoClient = new MongoClient(connectionString);
        var database = mongoClient.GetDatabase("Capstone");
        var collection = database.GetCollection<User>("Users");

        User existingUser = await FindUserByEmail(email);

        if (existingUser != null)
        {
            try
            {
                var filter = Builders<User>.Filter.Eq("Email", email);

                var update = Builders<User>.Update
                    .Set("Id", existingUser.Id)
                    .Set("Username", user.Username)
                    .Set("Password", user.Password)
                    .Set("Email", user.Email)
                    .Set("profile", user.Profile)
                    .Set("settings", user.Settings);

                await collection.UpdateOneAsync(filter, update);
                return new APIGatewayProxyResponse
                {
                    Body = JsonSerializer.Serialize(new { message = user }),
                    StatusCode = 200,
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }
            catch (Exception e)
            {
                return new APIGatewayProxyResponse
                {
                    Body = JsonSerializer.Serialize(new { message = e.Message }),
                    StatusCode = 500,
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }
        }
        else
        {
            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(new { message = "Email not found" }),
                StatusCode = 500,
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
    }

    public static async Task<APIGatewayProxyResponse> deleteUser(string Id)
    {
        var mongoClient = new MongoClient(connectionString);
        var database = mongoClient.GetDatabase("Capstone");
        var collection = database.GetCollection<User>("Users");
        var filter = Builders<User>.Filter.Eq("Id", Id);
        User user = await collection.FindOneAndDeleteAsync(filter);
        return new APIGatewayProxyResponse
        {
            Body = JsonSerializer.Serialize(new { message = user }),
            StatusCode = 200,
            Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
        };
    }

    public static async Task<User> FindUserByEmail(string email)
    {
        var mongoClient = new MongoClient(connectionString);
        var database = mongoClient.GetDatabase("Capstone");
        var collection = database.GetCollection<User>("Users");
        var filter = Builders<User>.Filter.Eq("Email", email);
        User user = await collection.Find(filter).FirstOrDefaultAsync();

        return user;
    }

    public static async Task<User> FindUserByUsername(string username)
    {
        var mongoClient = new MongoClient(connectionString);
        var database = mongoClient.GetDatabase("Capstone");
        var collection = database.GetCollection<User>("Users");
        var filter = Builders<User>.Filter.Eq("Username", username);
        User user = await collection.Find(filter).FirstOrDefaultAsync();

        return user;
    }
}
