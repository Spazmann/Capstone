const express = require('express');
const router = express.Router();

router.get('/', async function(req, res) {
  var user = req.session ? req.session.user : null;
  res.render('home', { title: "Home Page", });
});

module.exports = router;