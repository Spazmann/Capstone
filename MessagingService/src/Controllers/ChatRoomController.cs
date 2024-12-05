using Microsoft.AspNetCore.Mvc;
using MessagingService.Models;
using MessagingService.Services;
using System.Threading.Tasks;

namespace MessagingService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatRoomController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        public ChatRoomController(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        // POST: api/chatroom
        [HttpPost]
        public async Task<IActionResult> CreateChatRoom([FromBody] CreateChatRoomRequest request)
        {
            if (string.IsNullOrEmpty(request.User1Id) || string.IsNullOrEmpty(request.User2Id))
            {
                return BadRequest("Both User1Id and User2Id are required.");
            }

            var chatRoom = await _mongoDbService.CreateChatRoomAsync(request.User1Id, request.User2Id);

            return Ok(new { ChatRoomId = chatRoom.Id });
        }
    }

    public class CreateChatRoomRequest
    {
        public string User1Id { get; set; }
        public string User2Id { get; set; }
    }
}
