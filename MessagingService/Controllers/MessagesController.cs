using Microsoft.AspNetCore.Mvc;
using MessagingBackend.Models;
using MessagingBackend.Services;

namespace MessagingBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagesController : ControllerBase
    {
        private readonly MongoDbService _dbService;

        public MessagesController(MongoDbService dbService)
        {
            _dbService = dbService;
        }

        [HttpGet("{senderId}/{receiverId}")]
        public async Task<IActionResult> GetMessages(string senderId, string receiverId)
        {
            var messages = await _dbService.GetMessages(senderId, receiverId);
            return Ok(messages);
        }
    }
}
