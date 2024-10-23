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

module.exports = router;