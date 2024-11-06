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

    public async Task<APIGatewayProxyResponse> GetPostsByReply(APIGatewayProxyRequest request, ILambdaContext context)
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

            if (request.PathParameters == null || !request.PathParameters.ContainsKey("replyId"))
            {
                return new APIGatewayProxyResponse
                {
                    Body = JsonSerializer.Serialize(new { error = "Missing replyId in path parameters" }),
                    StatusCode = 400,
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }

            string replyId = request.PathParameters["replyId"];

            var replyPosts = await PostDatabase.GetPostsByReplyId(page, pageSize, replyId).WaitAsync(cts.Token);

            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(replyPosts),
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
            LambdaLogger.Log($"Error in GetPostsByReply: {ex}");
            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(new { error = ex.Message }),
                StatusCode = 500,
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
    }

    public async Task<APIGatewayProxyResponse> GetUserTopLevelPosts(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            if (!request.PathParameters.ContainsKey("userId"))
            {
                return new APIGatewayProxyResponse
                {
                    Body = JsonSerializer.Serialize(new { error = "User ID is required" }),
                    StatusCode = 400,
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }

            string userId = request.PathParameters["userId"];
            int page = 1; 
            int pageSize = 15; 

            if (request.QueryStringParameters != null && request.QueryStringParameters.ContainsKey("page"))
            {
                int.TryParse(request.QueryStringParameters["page"], out page);
            }

            var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
            var posts = await PostDatabase.GetTopLevelPostsByUser(userId, page, pageSize).WaitAsync(cts.Token);

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
            LambdaLogger.Log($"Error in GetUserTopLevelPosts: {ex}");
            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(new { error = ex.Message }),
                StatusCode = 500,
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
    }

    public async Task<APIGatewayProxyResponse> GetUserMediaPosts(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            if (!request.PathParameters.ContainsKey("userId"))
            {
                return new APIGatewayProxyResponse
                {
                    Body = JsonSerializer.Serialize(new { error = "User ID is required" }),
                    StatusCode = 400,
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }

            string userId = request.PathParameters["userId"];
            int page = 1; 
            int pageSize = 15; 

            if (request.QueryStringParameters != null && request.QueryStringParameters.ContainsKey("page"))
            {
                int.TryParse(request.QueryStringParameters["page"], out page);
            }

            var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
            var posts = await PostDatabase.GetMediaPostsByUser(userId, page, pageSize).WaitAsync(cts.Token);

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
            LambdaLogger.Log($"Error in GetUserMediaPosts: {ex}");
            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(new { error = ex.Message }),
                StatusCode = 500,
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
    }

    public async Task<APIGatewayProxyResponse> GetUserReplies(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            if (!request.PathParameters.ContainsKey("userId"))
            {
                return new APIGatewayProxyResponse
                {
                    Body = JsonSerializer.Serialize(new { error = "User ID is required" }),
                    StatusCode = 400,
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }

            string userId = request.PathParameters["userId"];
            int page = 1; 
            int pageSize = 15; 

            if (request.QueryStringParameters != null && request.QueryStringParameters.ContainsKey("page"))
            {
                int.TryParse(request.QueryStringParameters["page"], out page);
            }

            var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
            var posts = await PostDatabase.GetRepliesByUser(userId, page, pageSize).WaitAsync(cts.Token);

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
            LambdaLogger.Log($"Error in GetUserReplies: {ex}");
            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(new { error = ex.Message }),
                StatusCode = 500,
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
    }

    public async Task<APIGatewayProxyResponse> EditPost(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            if (!request.PathParameters.ContainsKey("id"))
            {
                return new APIGatewayProxyResponse
                {
                    Body = JsonSerializer.Serialize(new { error = "Post ID is required" }),
                    StatusCode = 400,
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }

            string postId = request.PathParameters["id"];
            var updatedPost = JsonSerializer.Deserialize<Post>(request.Body);

            if (updatedPost == null)
            {
                return new APIGatewayProxyResponse
                {
                    Body = JsonSerializer.Serialize(new { error = "Invalid post data" }),
                    StatusCode = 400,
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }

            var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
            var response = await PostDatabase.EditPost(updatedPost, postId).WaitAsync(cts.Token);

            return response;
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
            LambdaLogger.Log($"Error in EditPost: {ex}");
            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(new { error = ex.Message }),
                StatusCode = 500,
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
    }

    public async Task<APIGatewayProxyResponse> GetPost(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            if (!request.PathParameters.ContainsKey("id"))
            {
                return new APIGatewayProxyResponse
                {
                    Body = JsonSerializer.Serialize(new { error = "Post ID is required" }),
                    StatusCode = 400,
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }

            string postId = request.PathParameters["id"];
            var post = await PostDatabase.GetPostById(postId);

            if (post == null)
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
                Body = JsonSerializer.Serialize(post),
                StatusCode = 200,
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
        catch (Exception ex)
        {
            LambdaLogger.Log($"Error in GetPost: {ex.Message}");
            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(new { error = ex.Message }),
                StatusCode = 500,
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
    }


}
