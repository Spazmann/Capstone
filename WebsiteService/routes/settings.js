const express = require('express');
const dal = require('../api/userService');
const { uploadFile } = require('../api/s3');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', async function(req, res) {
    var user = req.session ? req.session.user : null;
    if(user == null) {
      return res.redirect('/');
    }
    res.render('settings', { title: "Account Settings", user: user });
});


router.post('/update-username', async function(req, res) {
  var user = req.session ? req.session.user : null;

  if (user == null) {
      return res.redirect('/');
  }

  const newUsername = req.body.username;

  const updatedUser = {
      ...user,  
      Username: newUsername
  };

  try {
      await dal.updateUser((error, responseData) => {
          if (error) {
              console.error("Failed to update user:", error);
              return res.render('settings', {
                  title: "Account Settings",
                  user: user,
                  error: "Error updating username"
              });
          }

          req.session.user = updatedUser;

          return res.redirect('/settings');
      }, updatedUser, user.Id);

  } catch (error) {
      console.error('Error updating user:', error);
      res.render('settings', {
          title: "Account Settings",
          user: user,
          error: "An error occurred while updating username"
      });
  }
});

router.post('/editProfile', upload.fields([{ name: 'profileImage' }, { name: 'bannerImage' }]), async (req, res) => {
    const { name } = req.body;
    const userId = req.session.user.Id;
  
    try {
      const userData = {
        Username: req.session.user.Username,
        Password: req.session.user.Password,
        Email: req.session.user.Email,
        Profile: {
          name: name || req.session.user.Profile.name,
          birthDate: req.session.user.Profile.birthDate,
          gender: req.session.user.Profile.gender,
          bannerImage: req.session.user.Profile.bannerImage,
          profileImage: req.session.user.Profile.profileImage,
          bio: req.session.user.Profile.bio,
          location: req.session.user.Profile.location
        },
        Settings: {
          bannedWords: req.session.user.Settings.bannedWords,
          darkMode: req.session.user.Settings.darkMode
        },
        Followers: req.session.user.Followers,
        Following: req.session.user.Following,
        Posts: req.session.user.Posts,
        Likes: req.session.user.Likes,
        Bookmarks: req.session.user.Bookmarks,
        Blocks: req.session.user.Blocks
      };

      if (req.files.profileImage) {
        const profileImageFile = req.files.profileImage[0];
        const profileImageName = `${userId}-profile-${Date.now()}${path.extname(profileImageFile.originalname)}`;

        await uploadFile(profileImageFile.buffer, profileImageName, profileImageFile.mimetype);

        userData.Profile.profileImage = profileImageName;
      }

      if (req.files.bannerImage) {
        const bannerImageFile = req.files.bannerImage[0];
        const bannerImageName = `${userId}-banner-${Date.now()}${path.extname(bannerImageFile.originalname)}`;

        await uploadFile(bannerImageFile.buffer, bannerImageName, bannerImageFile.mimetype);
  
        userData.Profile.bannerImage = bannerImageName;
      }
  
      dal.updateUser((error, data) => {
        if (error) {
          console.error("Error updating user:", error);
          return res.status(500).json({ error: "Failed to update profile" });
        }
        res.status(200).json({ message: "Profile updated successfully", data });
  
        req.session.user = userData;
      }, userData, userId);
    } catch (error) {
      console.error("Error in editProfile route:", error);
      res.status(500).json({ error: "An error occurred while updating the profile" });
    }
  });
  
  module.exports = router;
  