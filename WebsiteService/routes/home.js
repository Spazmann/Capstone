const express = require('express');
const router = express.Router();
const apl = require('../api/postService');
const dal = require('../api/userService')

router.get('/', async function(req, res) {
  const user = req.session ? req.session.user : null;
  if (!user) {
    return res.redirect('/');
  }

  try {
    apl.getPosts((error, posts) => {
      if (error) {
        console.error("Error fetching posts:", error);
        return res.status(500).send("Error fetching posts");
      }

      res.render('home', { title: "Home Page", user: user, posts: posts });
    }, 1);
  } catch (error) {
    console.error("Error in home route:", error);
    res.status(500).send("An error occurred while loading the page");
  }
});

module.exports = router;
