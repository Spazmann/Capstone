const express = require('express');
const router = express.Router();
const apl = require('../api/postService'); 
const dal = require('../api/userService'); 

router.get('/', async function (req, res) {
  const user = req.session ? req.session.user : null;
  if (!user) {
    return res.redirect('/'); // Redirect unauthenticated users to the login page
  }

  try {
    // Fetch posts
    const posts = await new Promise((resolve, reject) => {
      apl.getPosts((error, posts) => {
        if (error) {
          reject(error);
        } else {
          resolve(posts);
        }
      }, 1);
    });

    // Enhance posts with user and repost data
    const postsWithUserData = await Promise.all(
      posts.map(async (post) => {
        try {
          // Fetch user data for the original post
          const userData = await dal.findUserId(post.UserId);

          let postWithUserData = {
            ...post,
            Username: userData?.Username || "Unknown",
            Profile: userData?.Profile || {
              name: "Unknown User",
              profileImage: "defaultpfp.png",
              bannerImage: "defaultbanner.png",
              bio: "",
              location: "",
            },
          };

          // Fetch repost data if RepostId is present
          if (post.RepostId) {
            const repost = await new Promise((resolve, reject) => {
              apl.findPostById((error, repost) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(repost);
                }
              }, post.RepostId);
            });

            if (repost) {
              const repostUserData = await dal.findUserId(repost.UserId);
              postWithUserData.Repost = {
                ...repost,
                Username: repostUserData?.Username || "Unknown",
                Profile: repostUserData?.Profile || {
                  name: "Unknown User",
                  profileImage: "defaultpfp.png",
                  bannerImage: "defaultbanner.png",
                  bio: "",
                  location: "",
                },
              };
            }
          }

          return postWithUserData;
        } catch (error) {
          console.warn(`Error processing post with ID: ${post.Id}`, error);
          return {
            ...post,
            Username: "Unknown",
            Profile: {
              name: "Unknown User",
              profileImage: "defaultpfp.png",
              bannerImage: "defaultbanner.png",
              bio: "",
              location: "",
            },
          };
        }
      })
    );

    // Render the home page
    res.render('home', {
      title: "Home Page",
      user: user,
      posts: postsWithUserData,
    });
  } catch (error) {
    console.error("Error in home route:", error);
    res.status(500).send("An error occurred while loading the page");
  }
});


module.exports = router;
