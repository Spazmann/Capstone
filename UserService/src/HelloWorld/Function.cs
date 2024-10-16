using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Net.Http;
using System.Text.Json;
using Amazon.Lambda.Core;
using Amazon.Lambda.APIGatewayEvents;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace HelloWorld;

public class Function
{

    public async Task<APIGatewayProxyResponse> CreateUser(APIGatewayProxyRequest request, ILambdaContext context)
    {
        Console.WriteLine("Reached Create User");
        try
        {
            var input = JsonSerializer.Deserialize<User>(request.Body);

            if (input == null)
            {
                return new APIGatewayProxyResponse
                {
                    Body = JsonSerializer.Serialize(new { error = "Invalid user data" }),
                    StatusCode = 400,
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }

            Console.WriteLine("Before User Was added to database");

            var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
            var response = await UserDatabase.AddUserToDatabase(input).WaitAsync(cts.Token);

            Console.WriteLine("After User Was added to database");

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
                StatusCode = 504, // Gateway Timeout
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
        catch (Exception ex)
        {
            LambdaLogger.Log($"Error in CreateUser: {ex}");
            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(new { error = ex.Message }),
                StatusCode = 500,
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
    }

    public async Task<APIGatewayProxyResponse> CheckUserEmailHandler(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            var queryParams = request.QueryStringParameters;

            if (queryParams == null || !queryParams.ContainsKey("username") || !queryParams.ContainsKey("email"))
            {
                return new APIGatewayProxyResponse
                {
                    Body = JsonSerializer.Serialize(new { error = "Username and email are required as query parameters." }),
                    StatusCode = 400,
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }

            string username = queryParams["username"];
            string email = queryParams["email"];

            var response = await UserDatabase.CheckUserEmail(username, email);

            return response;
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

    public async Task<APIGatewayProxyResponse> FindUser(APIGatewayProxyRequest apigProxyEvent, ILambdaContext context)
    {
        try
        {
            string email = apigProxyEvent.PathParameters != null && apigProxyEvent.PathParameters.ContainsKey("Email")
            ? apigProxyEvent.PathParameters["Email"]
            : null;
            var response = await UserDatabase.FindUserByEmail(email);
            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(response),
                StatusCode = 200,
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

    public async Task<APIGatewayProxyResponse> UpdateUser(APIGatewayProxyRequest apigProxyEvent, ILambdaContext context)
    {

        try
        {
            var input = JsonSerializer.Deserialize<User>(apigProxyEvent.Body);
            string email = apigProxyEvent.PathParameters != null && apigProxyEvent.PathParameters.ContainsKey("Email")
            ? apigProxyEvent.PathParameters["Email"]
            : null;
            var response = await UserDatabase.EditUser(input,email);
            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(response.Body),
                StatusCode = response.StatusCode,
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

    public async Task<APIGatewayProxyResponse> DeleteUser(APIGatewayProxyRequest apigProxyEvent, ILambdaContext context)
    {

        try
        {
            string Id = apigProxyEvent.PathParameters != null && apigProxyEvent.PathParameters.ContainsKey("Id")
            ? apigProxyEvent.PathParameters["Id"]
            : null;
            var response = await UserDatabase.deleteUser(Id);
            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(response.Body),
                StatusCode = response.StatusCode,
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
}