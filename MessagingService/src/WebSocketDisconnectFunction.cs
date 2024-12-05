using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using MessagingService.Services;
using System.Threading.Tasks;

namespace MessagingService
{
    public class WebSocketDisconnectFunction
    {
        private readonly MongoDbService _mongoDbService;

        public WebSocketDisconnectFunction()
        {
            _mongoDbService = new MongoDbService();
        }

        public async Task<APIGatewayProxyResponse> HandleDisconnectAsync(APIGatewayProxyRequest request, ILambdaContext context)
        {
            var connectionId = request.RequestContext.ConnectionId;
            var userId = request.QueryStringParameters["userId"];  // Assuming userId is passed

            // Logic to retrieve the chat room associated with the user
            var chatRoom = await _mongoDbService.GetChatRoomForUserAsync(userId); // Retrieve chat room for the user

            if (chatRoom == null)
            {
                return new APIGatewayProxyResponse
                {
                    StatusCode = 400,
                    Body = "No chat room found for the user",
                    IsBase64Encoded = false
                };
            }

            // Remove the connection from the chat room
            await _mongoDbService.RemoveConnectionFromChatRoomAsync(chatRoom.Id, userId);

            return new APIGatewayProxyResponse
            {
                StatusCode = 200,
                Body = "Disconnected from chat room",
                IsBase64Encoded = false
            };
        }
    }
}
