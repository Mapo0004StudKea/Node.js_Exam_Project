import { checkSession } from './session.js';
import { fetchAndDisplayUsers } from './admin.js';

export const views = {
    '/': document.getElementById('view-home'),
    '/about': document.getElementById('view-about'),
    '/login': document.getElementById('view-login'),
    '/signup': document.getElementById('view-signup'),
    '/dashboard': document.getElementById('view-dashboard'),
    '/admin': document.getElementById('view-admin')
};

export function showRoute(route) {
    Object.values(views).forEach(v => {return v.classList.add('hidden')});
    const view = views[route] || views['/'];
    view.classList.remove('hidden');

    if (route === '/dashboard') {
        checkSession();
    } else if (route === '/admin') {
        fetchAndDisplayUsers(); 
    }
}

window.addEventListener('hashchange', () => {return showRoute(location.hash.slice(1) || '/')});
window.addEventListener('load', () => {return showRoute(location.hash.slice(1) || '/')});