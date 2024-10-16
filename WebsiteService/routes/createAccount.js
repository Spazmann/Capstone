const express = require('express');
const dal = require('../api/userService')
const router = express.Router();

const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const queueUrl = '';

router.post('/', (req, res) => {
  const { username, password, email, birthDate } = req.body;

  const jsonData = {
    Username: username,
    Password: password,
    Email: email,
    Profile: {
      name: '', 
      birthDate: birthDate,
      gender: '', 
      bannerImage: '',
      profileImage: '', 
      bio: '', 
      location: ''
    },
    Settings: {
      bannedWords: [],
      darkMode: true
    }
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
