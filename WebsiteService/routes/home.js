const express = require('express');
const router = express.Router();
const apl = require('../api/postService'); 
const dal = require('../api/userService'); 

router.get('/', async function(req, res) {
  const user = req.session ? req.session.user : null;
  if (!user) {
    return res.redirect('/');
  }

  try {
    apl.getPosts(async (error, posts) => {
      if (error) {
        console.error("Error fetching posts:", error);
        return res.status(500).send("Error fetching posts");
      }

      const postsWithUserData = await Promise.all(
        posts.map(async post => {
          const userData = await dal.findUserId(post.UserId);
          if (!userData) {
            console.warn(`User not found for UserId: ${post.UserId}`);
            return {
              ...post,
              Username: "Unknown",
              Profile: {
                name: "Unknown User",
                profileImage: "defaultpfp.png",
                bannerImage: "defaultbanner.png", 
                bio: "",
                location: ""
              }
            };
          }

          return {
            ...post,
            Username: userData.Username,
            Profile: userData.Profile
          };
        })
      );

      res.render('home', { title: "Home Page", user: user, posts: postsWithUserData });
    }, 1);
  } catch (error) {
    console.error("Error in home route:", error);
    res.status(500).send("An error occurred while loading the page");
  }
});

module.exports = router;
