const express = require('express');
const { findChatRoom, createChatRoom } = require('../api/chatRoomService'); 
const router = express.Router();

router.post('/:receiverId', async (req, res) => {
    const loggedUser = req.session ? req.session.user : null;
    const receiverId = req.params.receiverId;

    if (!loggedUser) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // Check if ChatRoom already exists
        let chatRoom = await findChatRoom(loggedUser._id, receiverId);

        // If ChatRoom does not exist, create it
        if (!chatRoom) {
            chatRoom = await createChatRoom(loggedUser._id, receiverId);
        }

        res.status(200).json(chatRoom);
    } catch (error) {
        console.error('Error checking/creating ChatRoom:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
