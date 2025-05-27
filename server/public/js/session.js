import { initChat } from './chat.js';

export let currentUser = null;

export async function checkSession() {
  const msg = document.getElementById('dashboard-msg');

  const res = await fetch('/me', {
    credentials: 'include'
  });

  if (res.ok) {
    const data = await res.json();
    currentUser = data.data.username;
    msg.textContent = `Velkommen, ${currentUser}`;
    document.getElementById('logout-btn').style.display = 'inline';
    initChat();
  } else {
    toastr.warning('Din session er udløbet eller du er ikke logget ind.');
    location.hash = '/login';
  }
}