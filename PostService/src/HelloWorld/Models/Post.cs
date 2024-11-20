namespace HelloWorld.Models
{
    public class Post
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        public string Content { get; set; }  
        public string Media { get; set; }      
        public string ReplyId { get; set; }
        public string RepostId { get; set; }
        public string CreatedAt { get; set; } 
        public int Likes { get; set; }
        public int CommentCount { get; set; }
        public int RepostCount { get; set; }
        public int BookmarkCount { get; set; }
    }
}

