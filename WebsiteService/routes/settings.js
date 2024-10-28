const express = require('express');
const dal = require('../api/userService');
const router = express.Router();

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


module.exports = router;