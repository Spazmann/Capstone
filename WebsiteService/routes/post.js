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

router.get('/:postId', async (req, res) => {
  const user = req.session?.user || null;
  const postId = req.params.postId;

  try {
    const post = await new Promise((resolve, reject) => {
      apl.findPostById((error, data) => {
        if (error) return reject(error);
        if (!data) return reject(new Error("Post not found"));
        resolve(data);
      }, postId);
    });

    const userData = await dal.findUserId(post.UserId);
    let postWithUserData = {
      ...post,
      Profile: {
        name: userData?.Profile?.name || "Unknown User",
        profileImage: userData?.Profile?.profileImage || "default-profile.png",
      },
      Username: userData?.Username || "unknown",
    };

    if (post.RepostId) {
      try {
        const repost = await new Promise((resolve, reject) => {
          apl.findPostById((error, data) => {
            if (error) return reject(error);
            resolve(data);
          }, post.RepostId);
        });

        if (repost) {
          const repostUserData = await dal.findUserId(repost.UserId);
          postWithUserData.Repost = {
            ...repost,
            Profile: {
              name: repostUserData?.Profile?.name || "Unknown User",
              profileImage: repostUserData?.Profile?.profileImage || "default-profile.png",
            },
            Username: repostUserData?.Username || "unknown",
          };
        }
      } catch (error) {
        console.error(`Error fetching repost for RepostId: ${post.RepostId}`, error);
      }
    }

    const replies = await new Promise((resolve, reject) => {
      apl.findPostByReplyId((error, data) => {
        if (error) return reject(error);
        resolve(data);
      }, postId);
    });

    const repliesWithUserData = await Promise.all(
      replies.map(async (reply) => {
        const replyUserData = await dal.findUserId(reply.UserId);
        return {
          ...reply,
          Profile: {
            name: replyUserData?.Profile?.name || "Unknown User",
            profileImage: replyUserData?.Profile?.profileImage || "default-profile.png",
          },
          Username: replyUserData?.Username || "unknown",
        };
      })
    );

    res.render('post', {
      title: "Post Page",
      user: user,
      post: postWithUserData,
      replies: repliesWithUserData,
    });
  } catch (error) {
    console.error("Error in post route:", error);
    res.status(500).json({ error: "An error occurred while loading the page" });
  }
});




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
      res.redirect('/');
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
    apl.findPostById(async (postError, postData) => {
      if (postError || !postData) {
        console.error("Error retrieving post data:", postError || "Post not found");
        return res.status(500).json({ error: "Failed to retrieve post data" });
      }

      if (!req.session.user.Likes.includes(postId)) {
        return res.status(400).json({ error: "Post is not liked by the user" });
      }

      const updatedPostData = {
        ...postData,
        Likes: Math.max(0, postData.Likes - 1)
      };

      apl.editPost(async (editError, updatedPost) => {
        if (editError) {
          console.error("Error updating post likes:", editError);
          return res.status(500).json({ error: "Failed to update post likes" });
        }

        const updatedUserData = {
          ...req.session.user,
          Likes: req.session.user.Likes.filter(id => id !== postId)
        };

        dal.updateUser((userError, savedUser) => {
          if (userError) {
            console.error("Error updating user's Likes array in the database:", userError);
            return res.status(500).json({ error: "Failed to update user's Likes array in the database" });
          }

          const parsedUser = typeof savedUser === 'string' ? JSON.parse(savedUser).message : savedUser;

          req.session.user = parsedUser;

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

router.post('/reply/:postId', upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.postId;
    let media = null;

    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

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
      ReplyId: postId,
      CreatedAt: new Date()
    };

    apl.createPost(async (error, replyData) => {
      if (error) {
        console.error("Error creating reply post:", error);
        return res.status(500).json({ error: "Failed to create reply post" });
      }

      apl.findPostById(async (findError, mainPost) => {
        if (findError || !mainPost) {
          console.error("Error fetching main post:", findError || "Main post not found");
          return res.status(500).json({ error: "Failed to fetch main post for updating CommentCount" });
        }

        const updatedPostData = {
          ...mainPost,
          CommentCount: (mainPost.CommentCount || 0) + 1
        };

        apl.editPost((editError, updatedMainPost) => {
          if (editError) {
            console.error("Error updating CommentCount on main post:", editError);
            return res.status(500).json({ error: "Failed to update CommentCount on main post" });
          }
            res.redirect(`/post/${postId}`)

        }, updatedPostData, postId);
      }, postId);
    }, postData);
  } catch (error) {
    console.error("Error in reply post route:", error);
    res.status(500).json({ error: "An error occurred while processing the reply" });
  }
});

router.get('/user/:userId/posts', async (req, res) => {
  const userId = req.params.userId;
  const page = req.query.page || 1;

  try {
    apl.getUserTopLevelPosts((error, data) => {
      if (error) {
        console.error("Error fetching user's posts:", error);
        return res.status(500).json({ error: "Failed to fetch user's posts" });
      }
      res.status(200).json(data);
    }, userId, page);
  } catch (error) {
    console.error("Error in getUserTopLevelPosts route:", error);
    res.status(500).json({ error: "An error occurred while fetching user's top-level posts" });
  }
});


router.get('/user/:userId/replies', async (req, res) => {
  const userId = req.params.userId;
  const page = req.query.page || 1;

  try {
    apl.getUserReplies((error, data) => {
      if (error) {
        console.error("Error fetching user's replies:", error);
        return res.status(500).json({ error: "Failed to fetch user's replies" });
      }
      res.status(200).json(data);
    }, userId, page);
  } catch (error) {
    console.error("Error in getUserReplies route:", error);
    res.status(500).json({ error: "An error occurred while fetching user's replies" });
  }
});

router.get('/user/:userId/media', async (req, res) => {
  const userId = req.params.userId;
  const page = req.query.page || 1;

  try {
    apl.getUserMediaPosts((error, data) => {
      if (error) {
        console.error("Error fetching user's media posts:", error);
        return res.status(500).json({ error: "Failed to fetch user's media posts" });
      }
      res.status(200).json(data);
    }, userId, page);
  } catch (error) {
    console.error("Error in getUserMediaPosts route:", error);
    res.status(500).json({ error: "An error occurred while fetching user's media posts" });
  }
});

router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const userData = await dal.findUserId(userId);

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Failed to retrieve user data" });
  }
});

router.post('/repost/:postId', upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.postId; // Ensure this is properly extracted

    if (!postId || postId === "null") {
      return res.status(400).json({ error: "Invalid postId for reposting" });
    }

    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.session.user.Id;

    const postData = {
      UserId: userId,
      Content: content,
      Media: null,
      ReplyId: null,
      RepostId: postId,
      CreatedAt: new Date(),
    };

    apl.createPost(async (error, createdPost) => {
      if (error) {
        console.error("Error creating repost:", error);
        return res.status(500).json({ error: "Failed to create repost" });
      }

      apl.findPostById(async (findError, mainPost) => {
        if (findError || !mainPost) {
          console.error("Error fetching main post:", findError || "Main post not found");
          return res.status(500).json({ error: "Failed to fetch main post for updating RepostCount" });
        }

        const updatedPostData = {
          ...mainPost,
          RepostCount: (mainPost.RepostCount || 0) + 1,
        };

        apl.editPost((editError, updatedMainPost) => {
          if (editError) {
            console.error("Error updating RepostCount on main post:", editError);
            return res.status(500).json({ error: "Failed to update RepostCount on main post" });
          }

          res.status(201).json({ message: "Repost created successfully", post: createdPost });
        }, updatedPostData, postId);
      }, postId);
    }, postData);
  } catch (error) {
    console.error("Error in repost route:", error);
    res.status(500).json({ error: "An error occurred while processing the repost" });
  }
});

router.post('/bookmark/:postId', async (req, res) => {
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
        BookmarkCount: postData.BookmarkCount + 1
      };

      apl.editPost(async (editError, updatedPost) => {
        if (editError) {
          console.error("Error updating post bookmarks:", editError);
          return res.status(500).json({ error: "Failed to update post bookmarks" });
        }

        const updatedUserData = {
          ...req.session.user,
          Bookmarks: Array.from(new Set([...req.session.user.Bookmarks, postId]))
        };

        dal.updateUser((userError, savedUser) => {
          if (userError) {
            console.error("Error updating user's bookmarks array in the database:", userError);
            return res.status(500).json({ error: "Failed to update user's bookmarks array in the database" });
          }

          const parsedUser = typeof savedUser === 'string' ? JSON.parse(savedUser).message : savedUser;

          req.session.user = parsedUser;


          res.status(200).json({
            message: "Post bookmarked successfully",
            post: updatedPost,
            user: parsedUser
          });
        }, updatedUserData, userId);
      }, updatedPostData, postId);
    }, postId);
  } catch (error) {
    console.error("Error in bookmarkPost route:", error);
    res.status(500).json({ error: "An error occurred while bookmarking the post" });
  }
});

router.delete('/bookmark/:postId', async (req, res) => {
  const postId = req.params.postId;
  const userId = req.session.user.Id;

  try {
    apl.findPostById(async (postError, postData) => {
      if (postError || !postData) {
        console.error("Error retrieving post data:", postError || "Post not found");
        return res.status(500).json({ error: "Failed to retrieve post data" });
      }

      if (!req.session.user.Bookmarks.includes(postId)) {
        return res.status(400).json({ error: "Post is not bookmarked by the user" });
      }

      const updatedPostData = {
        ...postData,
        BookmarkCount: Math.max(0, postData.BookmarkCount - 1)
      };

      apl.editPost(async (editError, updatedPost) => {
        if (editError) {
          console.error("Error updating post bookmarks:", editError);
          return res.status(500).json({ error: "Failed to update post bookmarks" });
        }

        const updatedUserData = {
          ...req.session.user,
          Bookmarks: req.session.user.Bookmarks.filter(id => id !== postId)
        };

        dal.updateUser((userError, savedUser) => {
          if (userError) {
            console.error("Error updating user's Bookmarks array in the database:", userError);
            return res.status(500).json({ error: "Failed to update user's Bookmarks array in the database" });
          }

          const parsedUser = typeof savedUser === 'string' ? JSON.parse(savedUser).message : savedUser;

          req.session.user = parsedUser;

          res.status(200).json({
            message: "Bookmark removed successfully",
            post: updatedPost,
            user: parsedUser
          });
        }, updatedUserData, userId);
      }, updatedPostData, postId);
    }, postId);
  } catch (error) {
    console.error("Error in unBookmarkPost route:", error);
    res.status(500).json({ error: "An error occurred while unBookmarking the post" });
  }
});


module.exports = router;
