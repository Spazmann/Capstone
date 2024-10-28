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

public class PostDatabase
{
    const string connectionString = "mongodb+srv://ddmann2004:9kt1LQi62AMBcXDW@cluster0.gzmfmz9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    private static readonly MongoClient mongoClient = new MongoClient(connectionString);

    public static async Task<APIGatewayProxyResponse> AddPost(Post post)
    {
        var database = mongoClient.GetDatabase("Capstone");
        var collection = database.GetCollection<User>("Posts");
    }

    public static async Task<APIGatewayProxyResponse> EditPost(User user, string id)
    {
        var database = mongoClient.GetDatabase("Capstone");
        var collection = database.GetCollection<User>("Posts");
    }
}
