const express = require('express');
const session = require('express-session');
const dal = require('../api/userService')
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
  res.render('index', { title: "Home Page", });
});

router.post('/api/checkuseremail', async (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ message: 'Username and email are required.' });
  }

  try {
    await dal.checkUserEmail((error, result) => {
      if (error) {
        console.error('Error:', error.message);
        return res.status(400).json({ message: error.message });
      }

      res.status(200).json(result);
    }, username, email);
  } catch (error) {
    console.error('Error in /api/checkuseremail:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});



module.exports = router;