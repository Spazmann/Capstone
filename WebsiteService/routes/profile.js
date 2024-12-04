const express = require('express');
const dal = require('../api/userService');
const { getObjectSignedUrl } = require('../api/s3');
const router = express.Router();

router.get('/:profile', async function(req, res) {
    var loggedInUser = req.session ? req.session.user : null;
    var profileUsername = req.params.profile;
    if (!loggedInUser) {
        return res.redirect('/');
    }

    try {
        const profileUser = await dal.findUser(profileUsername);
        
        if (profileUser) {
            res.render('profile', { 
                title: profileUser.Username, 
                user: loggedInUser, 
                profile: profileUser
            });
        } else {
            res.status(404).send('Profile not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching the profile');
    }
});

router.post('/follow/:userId', async function (req, res) {
    var loggedInUser = req.session ? req.session.user : null;
    var profileUserId = req.params.userId;

    if (!loggedInUser) {
        return res.status(401).json({ message: "User not logged in" });
    }

    try {
        const profileUser = await dal.findUserId(profileUserId);
        if (!profileUser) {
            return res.status(404).json({ message: "User to follow not found" });
        }

        const profileUserFollowers = new Set(profileUser.Followers || []);
        const loggedInUserFollowing = new Set(loggedInUser.Following || []);

        if (!profileUserFollowers.has(loggedInUser.Id)) {
            profileUserFollowers.add(loggedInUser.Id);

            loggedInUserFollowing.add(profileUserId);

            const updatedUserData = {
                ...req.session.user,
                Following: Array.from(loggedInUserFollowing),
            };

            dal.updateUser((userError, savedUser) => {
                if (userError) {
                    console.error("Error updating user's Following array in the database:", userError);
                    return res.status(500).json({ error: "Failed to update user's Following array in the database" });
                }

                const parsedUser = typeof savedUser === 'string' ? JSON.parse(savedUser).message : savedUser;

                req.session.user = parsedUser;

                dal.updateUser((profileError) => {
                    if (profileError) {
                        console.error("Error updating profile's Followers array in the database:", profileError);
                        return res.status(500).json({ error: "Failed to update profile's Followers array in the database" });
                    }

                    res.status(200).json({
                        message: "Followed successfully",
                        profileName: profileUser.Profile.name,
                        user: parsedUser,
                    });
                }, { Followers: Array.from(profileUserFollowers) }, profileUserId);
            }, updatedUserData, loggedInUser.Id);
        } else {
            return res.status(400).json({ message: "Already following this user" });
        }
    } catch (error) {
        console.error("Error in follow route:", error);
        res.status(500).json({ message: "An error occurred while following the user" });
    }
});

router.delete('/unfollow/:userId', async function (req, res) {
    const loggedInUser = req.session ? req.session.user : null;
    const profileUserId = req.params.userId;
  
    if (!loggedInUser) {
      return res.status(401).json({ message: "User not logged in" });
    }
  
    try {
      const profileUser = await dal.findUserId(profileUserId);
      if (!profileUser) {
        return res.status(404).json({ message: "User to unfollow not found" });
      }
  
      const profileUserFollowers = new Set(profileUser.Followers || []);
      const loggedInUserFollowing = new Set(loggedInUser.Following || []);
  
      if (profileUserFollowers.has(loggedInUser.Id)) {
        profileUserFollowers.delete(loggedInUser.Id);
        loggedInUserFollowing.delete(profileUserId);
  
        const updatedUserData = {
          ...req.session.user,
          Following: Array.from(loggedInUserFollowing),
        };
  
        dal.updateUser((userError, savedUser) => {
          if (userError) {
            console.error("Error updating user's Following array:", userError);
            return res.status(500).json({ error: "Failed to update Following array" });
          }
  
          const parsedUser = typeof savedUser === "string" ? JSON.parse(savedUser).message : savedUser;
  
          req.session.user = parsedUser;
  
          dal.updateUser((profileError) => {
            if (profileError) {
              console.error("Error updating profile's Followers array:", profileError);
              return res.status(500).json({ error: "Failed to update Followers array" });
            }
  
            res.status(200).json({
              message: "Unfollowed successfully",
              profileName: profileUser.Profile.name,
              user: parsedUser,
            });
          }, { Followers: Array.from(profileUserFollowers) }, profileUserId);
        }, updatedUserData, loggedInUser.Id);
      } else {
        res.status(400).json({ message: "You are not following this user" });
      }
    } catch (error) {
      console.error("Error in unfollow route:", error);
      res.status(500).json({ message: "An error occurred while unfollowing the user" });
    }
  });
  



module.exports = router;