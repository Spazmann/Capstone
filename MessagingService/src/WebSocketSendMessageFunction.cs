using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using MessagingService.Models;
using MessagingService.Services;
using Amazon.ApiGatewayManagementApi;
using Amazon.ApiGatewayManagementApi.Model;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace MessagingService
{
    public class WebSocketSendMessageFunction
    {
        private readonly MongoDbService _mongoDbService;
        private readonly IApiGatewayManagementApi _apiGatewayManagementApi;

        public WebSocketSendMessageFunction()
        {
            _mongoDbService = new MongoDbService();
            // Initialize the ApiGatewayManagementApi client to communicate with the WebSocket connections
            _apiGatewayManagementApi = new ApiGatewayManagementApiClient(new AmazonApiGatewayManagementApiConfig
            {
                ServiceURL = "https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/Prod" // Replace with your actual WebSocket URL
            });
        }

        public async Task<APIGatewayProxyResponse> HandleSendMessageAsync(APIGatewayProxyRequest request, ILambdaContext context)
        {
            // Deserialize the body
            var body = JsonConvert.DeserializeObject<dynamic>(request.Body);
            string chatRoomId = body.chatRoomId;
            string senderId = body.senderId;
            string messageContent = body.messageContent;

            // Create the message
            var message = new Message
            {
                Id = Guid.NewGuid().ToString(),
                SendingUserId = senderId,
                Content = messageContent,
                Timestamp = DateTime.UtcNow
            };

            // Store the message in MongoDB
            await _mongoDbService.AddMessageToChatRoomAsync(chatRoomId, message);

            // Retrieve the chat room
            var chatRoom = await _mongoDbService.GetChatRoomByIdAsync(chatRoomId);
            if (chatRoom == null)
            {
                return new APIGatewayProxyResponse
                {
                    StatusCode = 404,
                    Body = "Chat room not found",
                    IsBase64Encoded = false
                };
            }

            // Send the message to both users in the chat room
            var connectionIds = chatRoom.Connections.Values.ToList();  // List of connection IDs
            foreach (var connectionId in connectionIds)
            {
                try
                {
                    // Send the message to the WebSocket connection using PostToConnection
                    await _apiGatewayManagementApi.PostToConnectionAsync(new PostToConnectionRequest
                    {
                        ConnectionId = connectionId,
                        Data = JsonConvert.SerializeObject(new { messageContent })
                    });
                }
                catch (Exception ex)
                {
                    // Handle potential errors such as the connection being closed
                    context.Logger.LogLine($"Error sending message to connection {connectionId}: {ex.Message}");
                }
            }

            return new APIGatewayProxyResponse
            {
                StatusCode = 200,
                Body = "Message Sent",
                IsBase64Encoded = false
            };
        }
    }
}
