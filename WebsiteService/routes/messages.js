const express = require('express');
const router = express.Router();

const users = [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
    { id: '3', name: 'Charlie' }
];

const messages = [
    { senderId: '1', receiverId: '2', content: 'Hello!', timestamp: '2024-12-04T10:00:00Z' },
    { senderId: '2', receiverId: '1', content: 'Hi there!', timestamp: '2024-12-04T10:01:00Z' }
];

router.get('/', (req, res) => {
    const user = req.session ? req.session.user : null;
    if (!user) {
      return res.redirect('/'); // Redirect unauthenticated users to the login page
    }
  
    res.render('messages', { users, user: null, messages: [], user: user });
});

router.get('/:userId', (req, res) => {
    const userId = req.params.userId;
    const user = users.find((u) => u.id === userId);

    const Loggeduser = req.session ? req.session.user : null;
    if (!Loggeduser) {
      return res.redirect('/'); // Redirect unauthenticated users to the login page
    }

    if (!user) {
        return res.status(404).send('User not found');
    }

    const userMessages = messages.filter(
        (m) =>
            (m.senderId === userId && m.receiverId === req.session.user.id) ||
            (m.receiverId === userId && m.senderId === req.session.user.id)
    );

    res.render('messages', { users, user, messages: userMessages, user: Loggeduser });
});

module.exports = router;
