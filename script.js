// script.js
document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    // Array to store the chat history in the format Google's API expects
    let chatHistory = [];

    // Function to add a message to the chat box and history
    function addMessage(message, sender) {
        // Create the main message container
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message', `${sender}-message`);

        // Create the icon
        const icon = document.createElement('div');
        icon.classList.add('message-icon');
        icon.textContent = sender === 'user' ? '🧑' : '🤖';

        // Create the content bubble
        const content = document.createElement('div');
        content.classList.add('message-content');
        content.textContent = message;

        // Append icon and content to the container
        messageContainer.appendChild(icon);
        messageContainer.appendChild(content);

        // For AI messages, add the copy and speak buttons
        if (sender === 'ai') {
            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('button-container');

            // Copy button
            const copyBtn = document.createElement('button');
            copyBtn.classList.add('control-button');
            copyBtn.textContent = '📋';
            copyBtn.title = 'Copy text';
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(message);
                copyBtn.textContent = '✅';
                setTimeout(() => { copyBtn.textContent = '📋'; }, 2000);
            };

            // Speak button
            const speakBtn = document.createElement('button');
            speakBtn.classList.add('control-button');
            speakBtn.textContent = '🔊';
            speakBtn.title = 'Read aloud';
            speakBtn.onclick = () => speakText(message);

            buttonContainer.appendChild(copyBtn);
            buttonContainer.appendChild(speakBtn);
            content.appendChild(buttonContainer);
        }

        // Add the completed message to the chat box
        chatBox.appendChild(messageContainer);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    
    // Function to speak text using browser's Speech Synthesis API
    function speakText(text) {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    }

    // Function to send message and history to the backend
    async function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;

        // Display user message and update history
        addMessage(message, 'user');
        chatHistory.push({ role: 'user', parts: [{ text: message }] });
        
        userInput.value = '';
        userInput.disabled = true;
        sendBtn.disabled = true;

        try {
            const response = await fetch('http://127.0.0.1:5000/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: chatHistory })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Display AI response and update history
            addMessage(data.reply, 'ai');
            chatHistory.push({ role: 'model', parts: [{ text: data.reply }] });

        } catch (error) {
            console.error('Error:', error);
            addMessage(`Sorry, something went wrong: ${error.message}`, 'ai');
        } finally {
            userInput.disabled = false;
            sendBtn.disabled = false;
            userInput.focus();
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
});