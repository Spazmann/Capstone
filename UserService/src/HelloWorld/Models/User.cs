
    public class User
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public Profile Profile { get; set; } 
        public Settings Settings { get; set; } 
        public List<string> Followers { get; set; }
        public List<string> Following { get; set; }
        public List<string> Posts { get; set; }
        public List<string> Likes { get; set; }
        public List<string> Bookmarks { get; set; }
        public List<string> Blocks { get; set; }
    }
