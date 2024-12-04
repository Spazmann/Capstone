const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('messageInput');
let selectedUserId = null;
let socket;

async function startChat(userId) {
    try {
        const response = await fetch(`/chatroom/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch or create chatroom');
        }

        const chatRoom = await response.json();
        selectedUserId = userId;

        document.querySelector('.chat-column').innerHTML = `
            <h2>${chatRoom.ReceiverId === selectedUserId ? chatRoom.ReceiverName : chatRoom.SenderName}</h2>
            <div class="messages" id="messages-container"></div>
            <form onSubmit="sendMessage(event)">
                <input type="text" id="messageInput" placeholder="Type a message">
                <button type="submit">Send</button>
            </form>
        `;

        renderMessages(chatRoom.messages);

        connectWebSocket();
    } catch (error) {
        console.error('Error starting chat:', error);
    }
}

function renderMessages(messages) {
    messagesContainer.innerHTML = '';
    messages.forEach((message) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = message.senderId === selectedUserId ? 'received' : 'sent';
        messageDiv.textContent = message.content;
        messagesContainer.appendChild(messageDiv);
    });
}

async function sendMessage(event) {
    event.preventDefault();

    const content = messageInput.value.trim();
    if (!content) return;

    try {
        const response = await fetch(`/messages/${selectedUserId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        const message = await response.json();

        const messageDiv = document.createElement('div');
        messageDiv.className = 'sent';
        messageDiv.textContent = message.content;
        messagesContainer.appendChild(messageDiv);

        messageInput.value = '';
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

function connectWebSocket() {
    if (socket) {
        socket.close();
    }

    socket = new WebSocket(`wss://your-signalr-url/chatHub`);

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.senderId === selectedUserId) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'received';
            messageDiv.textContent = message.content;
            messagesContainer.appendChild(messageDiv);
        }
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}
