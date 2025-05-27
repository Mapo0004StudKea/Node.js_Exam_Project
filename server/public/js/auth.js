export async function signup() {
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
    toastr.success('Bruger oprettet! Du kan nu logge ind.');
    location.hash = '/login';
  } else {
    toastr.error(data.error || 'Signup mislykkedes.');
  }
}

export async function login() {
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
    toastr.success('Du er logget ind!');
    location.hash = '/dashboard';
  } else {
    toastr.error(data.error || 'Login mislykkedes.');
  }
}

export async function logout() {
  await fetch('/logout', {
    method: 'POST',
    credentials: 'include'
  });
  toastr.info('Du er logget ud.');
  location.hash = '/';
}