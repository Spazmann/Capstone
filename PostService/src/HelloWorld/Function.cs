using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Text.Json;
using Amazon.Lambda.Core;
using Amazon.Lambda.APIGatewayEvents;
using HelloWorld.Models; 

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace HelloWorld;

public class Function
{
    public async Task<APIGatewayProxyResponse> CreatePost(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            var input = JsonSerializer.Deserialize<Post>(request.Body);

            if (input == null)
            {
                return new APIGatewayProxyResponse
                {
                    Body = JsonSerializer.Serialize(new { error = "Invalid user data" }),
                    StatusCode = 400,
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }

            var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
            var response = await PostDatabase.AddPost(input).WaitAsync(cts.Token);

            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(response.Body),
                StatusCode = 201,
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
        catch (OperationCanceledException)
        {
            LambdaLogger.Log("Database operation timed out.");
            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(new { error = "Database operation timed out." }),
                StatusCode = 504, 
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
        catch (Exception ex)
        {
            LambdaLogger.Log($"Error in CreatePost: {ex}");
            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(new { error = ex.Message }),
                StatusCode = 500,
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
    }

    public async Task<APIGatewayProxyResponse> GetPosts(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            int page = 1;
            if (request.QueryStringParameters != null && request.QueryStringParameters.ContainsKey("page"))
            {
                int.TryParse(request.QueryStringParameters["page"], out page);
            }

            int pageSize = 15;
            var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));

            var posts = await PostDatabase.GetPostsAsync(page, pageSize).WaitAsync(cts.Token);

            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(posts),
                StatusCode = 200,
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
        catch (OperationCanceledException)
        {
            LambdaLogger.Log("Database operation timed out.");
            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(new { error = "Database operation timed out." }),
                StatusCode = 504, 
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
        catch (Exception ex)
        {
            LambdaLogger.Log($"Error in GetPosts: {ex}");
            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(new { error = ex.Message }),
                StatusCode = 500,
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
    }
}
