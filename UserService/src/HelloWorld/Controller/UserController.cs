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
using BCrypt.Net;

public class UserDatabase
{
    const string connectionString = "mongodb+srv://ddmann2004:9kt1LQi62AMBcXDW@cluster0.gzmfmz9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    private static readonly MongoClient mongoClient = new MongoClient(connectionString);

   public static async Task<APIGatewayProxyResponse> AddUserToDatabase(User user)
    {
        try
        {
            var database = mongoClient.GetDatabase("Capstone");
            var collection = database.GetCollection<User>("Users");

            // Check if user with the same email exists
            var userWithSameEmail = await collection.Find(u => u.Email == user.Email).FirstOrDefaultAsync();
            if (userWithSameEmail != null)
            {
                return new APIGatewayProxyResponse
                {
                    Body = JsonSerializer.Serialize(new { message = $"User with Email {user.Email} already exists" }),
                    StatusCode = 400,
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }

            // Check if user with the same username exists
            var userWithSameUsername = await collection.Find(u => u.Username == user.Username).FirstOrDefaultAsync();
            if (userWithSameUsername != null)
            {
                return new APIGatewayProxyResponse
                {
                    Body = JsonSerializer.Serialize(new { message = $"User with Username {user.Username} already exists" }),
                    StatusCode = 400,
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }

            // Insert the new user
            user.Id = Guid.NewGuid().ToString();
            await collection.InsertOneAsync(user);

            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(new { message = "User created successfully", user }),
                StatusCode = 201,
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
        catch (Exception ex)
        {
            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(new { error = ex.Message }),
                StatusCode = 500,
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
    }

    public static async Task<APIGatewayProxyResponse> Login(string identifier, string password)
    {
        try
        {
            var database = mongoClient.GetDatabase("Capstone");
            var collection = database.GetCollection<User>("Users");

            var filter = Builders<User>.Filter.Or(
                Builders<User>.Filter.Eq("Username", identifier)
            );

            var foundUser = await collection.Find(filter).FirstOrDefaultAsync();

            if (foundUser == null)
            {
                return new APIGatewayProxyResponse
                {
                    Body = JsonSerializer.Serialize(new { error = "User not found or invalid credentials" }),
                    StatusCode = 404,
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(password, foundUser.Password);

            if (isPasswordValid)
            {
                return new APIGatewayProxyResponse
                {
                    Body = JsonSerializer.Serialize(new { message = "Login successful", user = foundUser }),
                    StatusCode = 200,
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }
            else
            {
                return new APIGatewayProxyResponse
                {
                    Body = JsonSerializer.Serialize(new { error = "Invalid password" }),
                    StatusCode = 401,
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }
        }
        catch (Exception ex)
        {
            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(new { error = ex.Message }),
                StatusCode = 500,
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
    }



    public static async Task<APIGatewayProxyResponse> CheckUserEmail(string username, string email) {
        try
        {
            var database = mongoClient.GetDatabase("Capstone");
            var collection = database.GetCollection<User>("Users");

            // Check if user with the same email exists
            var userWithSameEmail = await collection.Find(u => u.Email == email).FirstOrDefaultAsync();
            if (userWithSameEmail != null)
            {
                return new APIGatewayProxyResponse
                {
                    Body = JsonSerializer.Serialize(new { message = $"User with Email {email} already exists" }),
                    StatusCode = 400,
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }

            // Check if user with the same username exists
            var userWithSameUsername = await collection.Find(u => u.Username == username).FirstOrDefaultAsync();
            if (userWithSameUsername != null)
            {
                return new APIGatewayProxyResponse
                {
                    Body = JsonSerializer.Serialize(new { message = $"User with Username {username} already exists" }),
                    StatusCode = 400,
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }

            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(new { message = "This username and email is unused" }),
                StatusCode = 200,
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        } catch (Exception ex)
        {
            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(new { error = ex.Message }),
                StatusCode = 500,
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
        
    }

    public static async Task<APIGatewayProxyResponse> EditUser(User user, string id)
    {
        var mongoClient = new MongoClient(connectionString);
        var database = mongoClient.GetDatabase("Capstone");
        var collection = database.GetCollection<User>("Users");

        User existingUser = await FindUserById(id);

        if (existingUser != null)
        {
            try
            {
                var filter = Builders<User>.Filter.Eq("_id", id);

                var update = Builders<User>.Update
                    .Set("Username", user.Username)
                    .Set("Password", user.Password)
                    .Set("Email", user.Email)
                    .Set("Profile", user.Profile)
                    .Set("Settings", user.Settings)
                    .Set("Followers", user.Followers)
                    .Set("Following", user.Following)
                    .Set("Posts", user.Posts)
                    .Set("Likes", user.Likes)
                    .Set("Bookmarks", user.Bookmarks)
                    .Set("Blocks", user.Blocks);

                await collection.UpdateOneAsync(filter, update);

                user.Id = id;

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
                Body = JsonSerializer.Serialize(new { message = "Id not found" }),
                StatusCode = 404,
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

        public static async Task<User> FindUserById(string id)
    {
        var mongoClient = new MongoClient(connectionString);
        var database = mongoClient.GetDatabase("Capstone");
        var collection = database.GetCollection<User>("Users");
        var filter = Builders<User>.Filter.Eq("_id", id);
        User user = await collection.Find(filter).FirstOrDefaultAsync();

        return user;
    }
}
