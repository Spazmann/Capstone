const express = require('express');
const router = express.Router();

const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const queueUrl = '';

router.post('/', function(req, res) {
  
  const jsonData = {
    Username: req.body.username,
    Email: req.body.email,
    Password: req.body.password
  };

  dal.addUser((err) => {
    if (err) {
      console.error("Error adding user:", err);
      return res.status(500).send("Error adding user.");
    }

    // const params = {
    //   MessageBody: JSON.stringify({
    //     email: jsonData.Email,
    //     username: jsonData.Username,
    //     message: `Congratulations, ${jsonData.Username}! Your account has been created successfully.`,
    //   }),
    //   QueueUrl: queueUrl
    // };

    // sqs.sendMessage(params, (err, data) => {
    //   if (err) {
    //     console.log("Error sending message to SQS", err);
    //     return res.status(500).send("Error sending message to the queue.");
    //   } else {
    //     console.log("Success", data.MessageId);
    //     res.redirect('/');
    //   }
    // });
  }, jsonData);
});
  
module.exports = router;
