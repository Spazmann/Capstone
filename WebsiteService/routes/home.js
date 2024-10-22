const express = require('express');
const router = express.Router();

router.get('/', async function(req, res) {
  var user = req.session ? req.session.user : null;
  if(user == null) {
    return res.redirect('/');
  }
  res.render('home', { title: "Home Page", user: user });
});

module.exports = router;