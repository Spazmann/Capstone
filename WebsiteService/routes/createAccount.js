const express = require('express');
const dal = require('../api/userService')
const router = express.Router();
const { hashPassword } = require('../security/passwordUtils'); 

const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const queueUrl = '';

router.post('/', async  (req, res) => {
  const { username, password, email, birthDate } = req.body;
  const hashedPassword = await hashPassword(password);

  const jsonData = {
    Username: username,
    Password: hashedPassword,
    Email: email,
    Profile: {
      name: username, 
      birthDate: birthDate,
      gender: '', 
      bannerImage: 'defaultbanner.png',
      profileImage: 'defaultpfp.png', 
      bio: '', 
      location: ''
    },
    Settings: {
      bannedWords: [],
      darkMode: true
    },
    Followers: [],
    Following: [],
    Posts: [],
    Likes: [],
    Bookmarks: [],
    Blocks: []
  };

  dal.addUser((err) => {
    if (err) {
      console.error('Error adding user:', err);
      return res.status(500).send('Error adding user.');
    }
    res.status(201).send('User created successfully!');
  }, jsonData);
});

module.exports = router;
