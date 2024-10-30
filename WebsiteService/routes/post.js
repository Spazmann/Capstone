const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const apl = require('../api/postService'); 
const dal = require('../api/userService');

const { uploadFile } = require('../api/s3');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;
    let media = null;

    if (req.file) {
      const file = req.file;
      const imageName = generateFileName();
      const fileBuffer = await sharp(file.buffer)
        .resize({ height: 1080, width: 1920, fit: "contain" })
        .toBuffer();

      await uploadFile(fileBuffer, imageName, file.mimetype);
      media = imageName;
    }

    const userId = req.session.user.Id;

    const postData = {
      UserId: userId,
      Content: content,
      Media: media,
      ReplyId: null,
      CreatedAt: new Date() 
    };

    apl.createPost((error, data) => {
      if (error) {
        console.error("Error creating post:", error);
        return res.status(500).json({ error: "Failed to create post" });
      }
      res.status(201).json({ message: "Post created successfully", data });
    }, postData);
  } catch (error) {
    console.error("Error handling post request:", error);
    res.status(500).json({ error: "An error occurred while processing the post" });
  }
});

router.post('/like/:postId', async (req, res) => {
  const postId = req.params.postId;
  const userId = req.session.user.Id;

  try {
    apl.findPostById(async (postError, postData) => {
      if (postError || !postData) {
        console.error("Error retrieving post data:", postError || "Post not found");
        return res.status(500).json({ error: "Failed to retrieve post data" });
      }

      const updatedPostData = {
        ...postData,
        Likes: postData.Likes + 1
      };

      apl.editPost(async (editError, updatedPost) => {
        if (editError) {
          console.error("Error updating post likes:", editError);
          return res.status(500).json({ error: "Failed to update post likes" });
        }

        const updatedUserData = {
          ...req.session.user,
          Likes: [...new Set([...req.session.user.Likes, postId])] 
        };

        dal.updateUser((userError, savedUser) => {
          if (userError) {
            console.error("Error updating user's Likes array in the database:", userError);
            return res.status(500).json({ error: "Failed to update user's Likes array in the database" });
          }

          const parsedUser = typeof savedUser === 'string' ? JSON.parse(savedUser).message : savedUser;

          req.session.user = parsedUser;


          res.status(200).json({
            message: "Post liked successfully",
            post: updatedPost,
            user: parsedUser
          });
        }, updatedUserData, userId);
      }, updatedPostData, postId);
    }, postId);
  } catch (error) {
    console.error("Error in likePost route:", error);
    res.status(500).json({ error: "An error occurred while liking the post" });
  }
});

router.delete('/like/:postId', async (req, res) => {
  const postId = req.params.postId;
  const userId = req.session.user.Id;

  try {
    // Step 1: Find the post by ID
    apl.findPostById(async (postError, postData) => {
      if (postError || !postData) {
        console.error("Error retrieving post data:", postError || "Post not found");
        return res.status(500).json({ error: "Failed to retrieve post data" });
      }

      // Step 2: Check if user has already liked the post
      if (!req.session.user.Likes.includes(postId)) {
        return res.status(400).json({ error: "Post is not liked by the user" });
      }

      // Step 3: Update the post's likes count by decreasing it
      const updatedPostData = {
        ...postData,
        Likes: Math.max(0, postData.Likes - 1) // Ensure Likes doesn't go below 0
      };

      apl.editPost(async (editError, updatedPost) => {
        if (editError) {
          console.error("Error updating post likes:", editError);
          return res.status(500).json({ error: "Failed to update post likes" });
        }

        // Step 4: Update the user's Likes array in the database by removing the postId
        const updatedUserData = {
          ...req.session.user,
          Likes: req.session.user.Likes.filter(id => id !== postId)
        };

        dal.updateUser((userError, savedUser) => {
          if (userError) {
            console.error("Error updating user's Likes array in the database:", userError);
            return res.status(500).json({ error: "Failed to update user's Likes array in the database" });
          }

          // Ensure savedUser is parsed from JSON
          const parsedUser = typeof savedUser === 'string' ? JSON.parse(savedUser).message : savedUser;

          // Step 5: Update the session user data after saving to database
          req.session.user = parsedUser;

          // Step 6: Respond with the updated data
          res.status(200).json({
            message: "Like removed successfully",
            post: updatedPost,
            user: parsedUser
          });
        }, updatedUserData, userId);
      }, updatedPostData, postId);
    }, postId);
  } catch (error) {
    console.error("Error in unlikePost route:", error);
    res.status(500).json({ error: "An error occurred while unliking the post" });
  }
});

module.exports = router;
