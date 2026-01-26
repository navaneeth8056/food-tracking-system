// Authentication and routing
const API_URL = window.location.origin + '/api';

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
        if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
            window.location.href = '/index.html';
        }
        return null;
    }
    
    return { token, role };
}

// Login function
async function login(username, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            
            if (data.role === 'admin') {
                window.location.href = '/admin.html';
            } else {
                window.location.href = '/delivery.html';
            }
        } else {
            throw new Error(data.error || 'Login failed');
        }
    } catch (error) {
        throw error;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/index.html';
}

// Get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Make authenticated API request
async function apiRequest(url, options = {}) {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers: { ...headers, ...options.headers }
    });
    
    if (response.status === 401) {
        logout();
        return null;
    }
    
    return response;
}

// Login form handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('errorMessage');
        
        try {
            await login(username, password);
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.add('show');
        }
    });
}

// Logout button handler
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', logout);
}
