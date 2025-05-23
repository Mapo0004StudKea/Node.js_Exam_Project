// Indlæs header og footer først, så siden kan vises bagefter
Promise.all([
  fetch("header.html").then(res => res.text()).then(html => {
    document.getElementById("header-container").innerHTML = html;
  }),
  fetch("footer.html").then(res => res.text()).then(html => {
    document.getElementById("footer-container").innerHTML = html;
  })
]).then(() => {
  // Når header og footer er indlæst, kan views tilgås
  const views = {
    '/': document.getElementById('view-home'),
    '/about': document.getElementById('view-about'),
    '/login': document.getElementById('view-login'),
    '/signup': document.getElementById('view-signup'),
    '/dashboard': document.getElementById('view-dashboard')
  };

  function showRoute(route) {
    Object.values(views).forEach(v => v.classList.add('hidden'));
    const view = views[route] || views['/'];
    view.classList.remove('hidden');

    if (route === '/dashboard') {
      checkSession();
    }
  }

  window.addEventListener('hashchange', () => {
    showRoute(location.hash.slice(1) || '/');
  });

  window.addEventListener('load', () => {
    showRoute(location.hash.slice(1) || '/');
  });
});

// Auth functions
async function signup() {
  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  const res = await fetch('/signup', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });

  const data = await res.json();
  if (res.ok) {
    alert("Signup successful");
    location.hash = '/dashboard';
  } else {
    alert(data.error || 'Signup failed');
  }
}

async function login() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  const res = await fetch('/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (res.ok) {
    location.hash = '/dashboard';
  } else {
    alert(data.error || 'Login failed');
  }
}

async function logout() {
  await fetch('/logout', {
    method: 'POST',
    credentials: 'include'
  });
  alert("Logged out");
  location.hash = '/';
}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 60%)`; // HSL-farve baseret på hash
  return color;
}

async function checkSession() {
  const msg = document.getElementById('dashboard-msg');

  const res = await fetch('/me', {
    credentials: 'include'
  });

  if (res.ok) {
    const data = await res.json();
    msg.textContent = `Welcome, ${data.data.username}`;
    document.getElementById('logout-btn').style.display = 'inline';
  } else {
    location.hash = '/login';
  }
}

// Socket.io
const socket = io();

// Når dashboard er synligt, sæt chat op
let chatInitialized = false;

function initChat() {
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

// Tilføj kald til initChat når man er på dashboard
let currentUser = null;

async function checkSession() {
  const msg = document.getElementById('dashboard-msg');
  const res = await fetch('/me', { credentials: 'include' });

  if (res.ok) {
    const data = await res.json();
    currentUser = data.data.username;
    msg.textContent = `Welcome, ${currentUser}`;
    document.getElementById('logout-btn').style.display = 'inline';

    initChat();
  } else {
    location.hash = '/login';
  }
}