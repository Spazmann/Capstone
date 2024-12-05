document.addEventListener("DOMContentLoaded", () => {
    const connection = new signalR.HubConnectionBuilder()
        .withUrl('https://yum6gmr8vh.execute-api.us-east-1.amazonaws.com/Prod/chatHub')
        .configureLogging(signalR.LogLevel.Information)
        .build();

    connection.start()
        .then(() => console.log("Connected to SignalR"))
        .catch((err) => console.error("Error connecting to SignalR:", err));

    let selectedUserId = null;

    document.querySelector('.sidebar ul').addEventListener('click', (event) => {
        const li = event.target.closest('li');
        if (li && li.dataset.userId) {
            startChat(li.dataset.userId);
        }
    });
    

    document.addEventListener("submit", (event) => {
        if (event.target.closest("form")) {
            sendMessage(event);
        }
    });

    async function startChat(userId) {
        selectedUserId = userId;

        try {
            const response = await fetch(`/messages/${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch chat room');
            }

            const chatData = await response.json();

            if (!chatData || !chatData.selectedUser || !chatData.messages) {
                throw new Error('Invalid chat data received');
            }

            document.querySelector('.chat-column').innerHTML = `
                <h2>${chatData.selectedUser.Profile.name}</h2>
                <div class="messages" id="messages-container"></div>
                <form onSubmit="sendMessage(event)">
                    <input type="text" id="messageInput" placeholder="Type a message">
                    <button type="submit">Send</button>
                </form>
            `;

            const messagesContainer = document.getElementById('messages-container');
            chatData.messages.forEach((message) => {
                const messageDiv = document.createElement('div');
                messageDiv.className = message.senderId === selectedUserId ? 'received' : 'sent';
                messageDiv.textContent = message.content;
                messagesContainer.appendChild(messageDiv);
            });

            await connection.invoke('JoinChatRoom', userId);
        } catch (error) {
            console.error('Error in startChat:', error.message);
        }
    }

    async function sendMessage(event) {
        event.preventDefault();

        const input = document.getElementById('messageInput');
        const content = input.value.trim();
        if (!content) return;

        await connection.invoke('SendMessage', selectedUserId, content);

        input.value = '';
    }

    function scrollToBottom() {
        const messagesContainer = document.getElementById('messages-container');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    connection.on('ReceiveMessage', (message) => {
        if (selectedUserId && message.senderId !== selectedUserId) return;

        const messagesContainer = document.getElementById('messages-container');
        const messageDiv = document.createElement('div');
        messageDiv.className = message.senderId === selectedUserId ? 'received' : 'sent';
        messageDiv.textContent = message.content;
        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
    });
});
