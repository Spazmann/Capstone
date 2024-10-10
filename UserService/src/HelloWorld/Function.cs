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

    public async Task<APIGatewayProxyResponse> CreateUser(APIGatewayProxyRequest apigProxyEvent, ILambdaContext context)
    {
        try
        {
            var input = JsonSerializer.Deserialize<User>(apigProxyEvent.Body);

            if (input == null)
            {
                return new APIGatewayProxyResponse
                {
                    Body = JsonSerializer.Serialize(new { error = "Invalid user data" }),
                    StatusCode = 400,
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }

            var response = await UserDatabase.AddUserToDatabase(input);

            return new APIGatewayProxyResponse
            {
                Body = JsonSerializer.Serialize(response.Body),
                StatusCode = 201, // Created
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
        catch (Exception ex)
        {
            LambdaLogger.Log($"Error in CreateUser: {ex.ToString()}");

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