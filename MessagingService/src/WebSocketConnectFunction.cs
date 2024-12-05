using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using MessagingService.Services;
using System.Threading.Tasks;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.Json.JsonSerializer))]

namespace MessagingService
{
    public class WebSocketConnectFunction
    {
        private readonly MongoDbService _mongoDbService;

        public WebSocketConnectFunction()
        {
            _mongoDbService = new MongoDbService();
        }

        public async Task<APIGatewayProxyResponse> HandleConnectAsync(APIGatewayProxyRequest request, ILambdaContext context)
        {
            var connectionId = request.RequestContext.ConnectionId;
            var userId = request.QueryStringParameters["userId"];  // Assuming the user ID is passed in the query parameters

            // Logic to retrieve chat room dynamically, based on userId or other parameters
            var chatRoom = await _mongoDbService.GetChatRoomForUserAsync(userId); // Method to retrieve chat room for the user

            if (chatRoom == null)
            {
                return new APIGatewayProxyResponse
                {
                    StatusCode = 400,
                    Body = "No chat room found for the user",
                    IsBase64Encoded = false
                };
            }

            // Add the connection to the chat room
            await _mongoDbService.AddConnectionToChatRoomAsync(chatRoom.Id, userId, connectionId);

            return new APIGatewayProxyResponse
            {
                StatusCode = 200,
                Body = "Connected to chat room",
                IsBase64Encoded = false
            };
        }
    }
}
