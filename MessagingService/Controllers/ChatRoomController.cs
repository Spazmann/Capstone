using MessagingBackend.Models;
using MessagingBackend.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace MessagingBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatRoomController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        public ChatRoomController(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllChatRooms()
        {
            var chatRooms = await _mongoDbService.GetAllChatRoomsAsync();
            return Ok(chatRooms);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetChatRoom(string id)
        {
            var chatRoom = await _mongoDbService.GetChatRoomByIdAsync(id);
            if (chatRoom == null)
                return NotFound();

            return Ok(chatRoom);
        }

        [HttpPost]
        public async Task<IActionResult> CreateChatRoom([FromBody] ChatRoom chatRoom)
        {
            chatRoom.Id = Guid.NewGuid().ToString(); // Assign a unique ID
            await _mongoDbService.CreateChatRoomAsync(chatRoom);
            return CreatedAtAction(nameof(GetChatRoom), new { id = chatRoom.Id }, chatRoom);
        }

        [HttpPost("{id}/messages")]
        public async Task<IActionResult> AddMessage(string id, [FromBody] Message message)
        {
            var chatRoom = await _mongoDbService.GetChatRoomByIdAsync(id);
            if (chatRoom == null)
                return NotFound();

            message.Id = Guid.NewGuid().ToString(); // Assign a unique ID
            message.Timestamp = DateTime.UtcNow;

            await _mongoDbService.AddMessageToChatRoomAsync(id, message);
            return Ok(message);
        }
    }
}
