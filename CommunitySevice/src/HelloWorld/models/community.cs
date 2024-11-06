namespace HelloWorld.Models
{
    public class Post
    {
        public string Id { get; set; }
        public string communityName { get; set; }
        public List<string> admins { get; set; }
        public List<string> mods { get; set; }
        public List<string> members { get; set; }
    }
}

