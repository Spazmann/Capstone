const express = require('express');
const { findUserId } = require('../api/userService'); 
const router = express.Router();

// Helper function to fetch valid users
const getValidUsers = async (loggedUser) => {
    const userIdsToMessage = loggedUser.Following.filter(id => loggedUser.Followers.includes(id));

    const users = await Promise.all(
        userIdsToMessage.map(async (id) => {
            try {
                return await findUserId(id);
            } catch (err) {
                console.error(`Failed to fetch user with ID ${id}:`, err);
                return null; 
            }
        })
    );

    return users.filter(user => user !== null);
};

// Route: GET /
router.get('/', async (req, res) => {
    const loggedUser = req.session ? req.session.user : null;

    if (!loggedUser) {
        return res.redirect('/'); 
    }

    try {
        const validUsers = await getValidUsers(loggedUser);
        res.render('messages', { users: validUsers, selectedUser: null, messages: [], loggedUser });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route: GET /:userId
router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;
    const loggedUser = req.session ? req.session.user : null;

    if (!loggedUser) {
        return res.redirect('/'); 
    }

    try {
        const selectedUser = await findUserId(userId);

        if (!selectedUser) {
            return res.status(404).send('User not found');
        }

        const validUsers = await getValidUsers(loggedUser);
        res.render('messages', { users: validUsers, selectedUser, messages: [], loggedUser });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
