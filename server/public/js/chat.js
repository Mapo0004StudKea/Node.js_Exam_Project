import { currentUser } from './session.js';
import { stringToColor } from './util.js';

const socket = io();
let chatInitialized = false;

export function initChat() {
  if (chatInitialized) return;
  chatInitialized = true;

  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const messages = document.getElementById('messages');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value && currentUser) {
      socket.emit('chat message', {
        user: currentUser,
        text: input.value
      });
      input.value = '';
    }
  });

  socket.on('chat message', (msg) => {
    const li = document.createElement('li');
    const usernameColor = stringToColor(msg.user);

    li.innerHTML = `<strong style="color:${usernameColor}">${msg.user}:</strong> ${msg.text}`;
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
  });
}