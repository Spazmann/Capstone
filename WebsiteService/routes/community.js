const express = require('express');
const dal = require('../api/userService');
const apl = require('../api/postService'); 
const cal = require('../api/communityService'); 
const router = express.Router();

router.post('/', async  (req, res) => {
    const user = req.session ? req.session.user : null;
    if (!user) {
      return res.redirect('/');
    }

    const { communityName } = req.body;   
    userId = user.Id;

    cal.createCommunity((err) => {
        if (err) {
            console.error('Error creating community:', err);
            return res.status(500).send('Error creating community.');
          }
          res.redirect('/home');
    }, communityName, userId);
});

router.get('/', async  (req, res) => {
  res.redirect('/');
});

module.exports = router;