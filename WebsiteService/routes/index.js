const express = require('express');
const session = require('express-session');
const router = express.Router();

router.use(session({
  secret: '1234',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

router.post('/', function(req, res) {
  var email = req.body.email;
  var password = req.body.password;

  dal.getUser((error, jsonData) => {
    if (error) {
      console.error('Error fetching user:', error);
      return res.json({ success: false, message: 'An error occurred. Please try again.' });
    }

    if (jsonData != null) {
      
    } else {
      return res.json({ success: false, message: 'Invalid email or password' });
    }
  }, email, password);
});


router.get('/', async function(req, res) {
  var user = req.session ? req.session.user : null;
  res.render('index', { title: "Home Page", });
});


module.exports = router;