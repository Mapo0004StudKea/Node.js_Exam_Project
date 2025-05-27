import { configureToastr } from './toastr-config.js';

const userTableBody = document.querySelector('#user-table tbody');
const createUsernameInput = document.getElementById('admin-create-username');
const createEmailInput = document.getElementById('admin-create-email');
const createPasswordInput = document.getElementById('admin-create-password');
const createRolesInput = document.getElementById('admin-create-roles');
const createButton = document.getElementById('admin-create-btn');

const editIdInput = document.getElementById('admin-edit-id');
const editUsernameInput = document.getElementById('admin-edit-username');
const editEmailInput = document.getElementById('admin-edit-email');
const editPasswordInput = document.getElementById('admin-edit-password');
const editRolesInput = document.getElementById('admin-edit-roles');
const loadUserButton = document.getElementById('admin-load-user-btn');
const saveButton = document.getElementById('admin-edit-btn');


// Funktion til at hente og vise brugere
async function fetchAndDisplayUsers() {
    try {
        const response = await fetch('/users/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const users = await response.json();
        userTableBody.innerHTML = '';

        users.forEach(user => {
            const row = userTableBody.insertRow();
            row.insertCell().textContent = user.id;
            row.insertCell().textContent = user.username;
            row.insertCell().textContent = user.email;
            row.insertCell().textContent = user.roles;
            row.insertCell().textContent = new Date(user.created_at).toLocaleDateString();

            const actionsCell = row.insertCell();
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('btn-orange', 'btn-small');
            editButton.addEventListener('click', () => {return loadUserForEdit(user.id)});
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('btn-gray', 'btn-small', 'ml-1');
            deleteButton.addEventListener('click', () => {return deleteUser(user.id)});
            actionsCell.appendChild(deleteButton);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        configureToastr('error', 'Failed to load users: ' + error.message);
    }
}

// Funktion til at oprette en ny bruger
createButton.addEventListener('click', async () => {
    const username = createUsernameInput.value.trim();
    const email = createEmailInput.value.trim();
    const password = createPasswordInput.value.trim();
    const roles = createRolesInput.value.trim();

    if (!username || !email || !password) {
        configureToastr('warning', 'Please fill in username, email, and password for new user.');
        return;
    }

    try {
        const response = await fetch('/users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password, roles }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to create user');
        }

        configureToastr('success', data.message || 'User created successfully!');
        // Ryd formularen
        createUsernameInput.value = '';
        createEmailInput.value = '';
        createPasswordInput.value = '';
        createRolesInput.value = 'user';
        fetchAndDisplayUsers(); 
    } catch (error) {
        console.error('Error creating user:', error);
        configureToastr('error', 'Failed to create user: ' + error.message);
    }
});

// Funktion til at indlæse en bruger for redigering
async function loadUserForEdit(userId = null) {
    const idToLoad = userId || editIdInput.value.trim();
    if (!idToLoad) {
        configureToastr('warning', 'Please enter a User ID to load.');
        return;
    }

    try {
        const response = await fetch(`/users/${idToLoad}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const user = await response.json();
        
        editIdInput.value = user.id;
        editUsernameInput.value = user.username;
        editEmailInput.value = user.email;
        editRolesInput.value = user.roles;
        editPasswordInput.value = '';
        configureToastr('info', `User ${user.username} loaded for editing.`);
    } catch (error) {
        console.error('Error loading user:', error);
        configureToastr('error', 'Failed to load user: ' + error.message);
    }
}

// Event listener for "Load User" knappen i redigeringssektionen
loadUserButton.addEventListener('click', () => {return loadUserForEdit()});

// Funktion til at gemme redigerede brugeroplysninger
saveButton.addEventListener('click', async () => {
    const id = editIdInput.value.trim();
    const username = editUsernameInput.value.trim();
    const email = editEmailInput.value.trim();
    const password = editPasswordInput.value.trim();
    const roles = editRolesInput.value.trim();

    if (!id || !username || !email) {
        configureToastr('warning', 'User ID, Username, and Email are required for editing.');
        return;
    }

    const updateData = { username, email, roles };
    if (password) {
        updateData.password = password;
    }

    try {
        const response = await fetch(`/users/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to update user');
        }

        configureToastr('success', data.message || 'User updated successfully!');
        // Ryd formularen
        editIdInput.value = '';
        editUsernameInput.value = '';
        editEmailInput.value = '';
        editPasswordInput.value = '';
        editRolesInput.value = '';
        fetchAndDisplayUsers();
    } catch (error) {
        console.error('Error updating user:', error);
        configureToastr('error', 'Failed to update user: ' + error.message);
    }
});

// Funktion til at slette en bruger
async function deleteUser(id) {
    try {
        const response = await fetch(`/users/${id}`, {
            method: 'DELETE',
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete user');
        }

        configureToastr('success', data.message || 'User deleted successfully!');
        fetchAndDisplayUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
        configureToastr('error', 'Failed to delete user: ' + error.message);
    }
}

export { fetchAndDisplayUsers };