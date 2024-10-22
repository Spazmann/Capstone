const express = require('express');
const dal = require('../api/userService');
const router = express.Router();

router.get('/:profile', async function(req, res) {
    var loggedInUser = req.session ? req.session.user : null;
    var profileUsername = req.params.profile;

    try {
        const profileUser = await dal.findUser(profileUsername);
        
        if (profileUser) {
            res.render('profile', { title: profileUser.Username, user: loggedInUser, profile: profileUser });
        } else {
            res.status(404).send('Profile not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching the profile');
    }
});

module.exports = router;