const { MongoClient, ObjectId } = require('mongodb');

const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || 'mongodb+srv://ddmann2004:9kt1LQi62AMBcXDW@cluster0.gzmfmz9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(MONGO_CONNECTION_STRING);
const database = client.db('Capstone');
const chatRooms = database.collection('Messages');

// Find ChatRoom by SenderId and ReceiverId
async function findChatRoom(senderId, receiverId) {
    return await chatRooms.findOne({
        $or: [
            { SenderId: senderId, ReceiverId: receiverId },
            { SenderId: receiverId, ReceiverId: senderId },
        ],
    });
}

// Create a new ChatRoom
async function createChatRoom(senderId, receiverId) {
    const chatRoom = {
        Id: new ObjectId().toString(),
        SenderId: senderId,
        ReceiverId: receiverId,
        messages: [],
    };

    const result = await chatRooms.insertOne(chatRoom);
    return result.ops[0];
}

module.exports = {
    findChatRoom,
    createChatRoom,
};
