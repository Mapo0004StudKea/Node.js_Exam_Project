const views = {
  '/': document.getElementById('view-home'),
  '/about': document.getElementById('view-about'),
  '/login': document.getElementById('view-login'),
  '/signup': document.getElementById('view-signup'),
  '/dashboard': document.getElementById('view-dashboard'),
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

async function logout() {
  await fetch('/logout', {
    method: 'POST',
    credentials: 'include'
  });
  alert("Logged out");
  location.hash = '/';
}
