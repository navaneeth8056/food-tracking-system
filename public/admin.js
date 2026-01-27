// Admin dashboard functionality
let clients = [];
let currentClientId = null;
let currentDate = new Date();

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    await loadClients();
    await loadPlaces();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Add client button
    document.getElementById('addClientBtn').addEventListener('click', () => {
        openClientModal();
    });
    
    // Back to clients button
    document.getElementById('backToClientsBtn').addEventListener('click', () => {
        showClientsView();
    });
    
    // Place filter
    document.getElementById('placeFilter').addEventListener('change', filterClients);
    
    // Modal close
    document.querySelectorAll('.close').forEach(close => {
        close.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal.id === 'deleteClientModal') {
                closeDeleteModal();
            } else {
                modal.style.display = 'none';
            }
        });
    });
    
    // Client form
    document.getElementById('clientForm').addEventListener('submit', saveClient);
    
    // Add days form
    document.getElementById('addDaysForm').addEventListener('submit', addDays);
    
    // Delete client form
    document.getElementById('deleteClientForm').addEventListener('submit', confirmDeleteClient);
}

// Load clients
async function loadClients() {
    try {
        const response = await apiRequest('/clients');
        if (!response) return;
        clients = await response.json();
        displayClients();
    } catch (error) {
        console.error('Error loading clients:', error);
    }
}

// Load places
async function loadPlaces() {
    try {
        const response = await apiRequest('/places');
        if (!response) return;
        const places = await response.json();
        const filterSelect = document.getElementById('placeFilter');
        
        places.forEach(place => {
            const option = document.createElement('option');
            option.value = place;
            option.textContent = place;
            filterSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading places:', error);
    }
}

// Display clients
function displayClients() {
    const container = document.getElementById('clientsList');
    const filtered = getFilteredClients();
    
    container.innerHTML = filtered.map(client => {
        const mapUrl = client.mapLocation || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.address)}`;
        return `
        <div class="client-card">
            <h3>${client.name}</h3>
            <p><strong>Phone:</strong> ${client.phone}</p>
            <p><strong>Address:</strong> ${client.address}</p>
            <p><strong>Place:</strong> ${client.place}</p>
            <p style="margin: 10px 0;">
                <a href="${mapUrl}" target="_blank" class="map-link-small">
                    📍 Get Directions
                </a>
            </p>
            <div class="days-info">
                <span class="days-badge days-total">Total: ${client.totalDays}</span>
                <span class="days-badge ${client.remainingDays < 5 ? 'days-low' : 'days-remaining'}">
                    Remaining: ${client.remainingDays}
                </span>
            </div>
            <div class="client-actions">
                <button class="btn-small btn-calendar" onclick="openCalendar('${client._id}')">Calendar</button>
                <button class="btn-small btn-add-days" onclick="openAddDaysModal('${client._id}')">Add Days</button>
                <button class="btn-small btn-edit" onclick="editClient('${client._id}')">Edit</button>
                <button class="btn-small btn-delete" onclick="deleteClient('${client._id}')">Delete</button>
            </div>
        </div>
    `;
    }).join('');
}

// Filter clients
function getFilteredClients() {
    const placeFilter = document.getElementById('placeFilter').value;
    if (!placeFilter) return clients;
    return clients.filter(c => c.place === placeFilter);
}

function filterClients() {
    displayClients();
}

// Open client modal
function openClientModal(client = null) {
    const modal = document.getElementById('clientModal');
    const form = document.getElementById('clientForm');
    const title = document.getElementById('modalTitle');
    
    if (client) {
        title.textContent = 'Edit Client';
        document.getElementById('clientId').value = client._id;
        document.getElementById('clientName').value = client.name;
        document.getElementById('clientPhone').value = client.phone;
        document.getElementById('clientAddress').value = client.address;
        document.getElementById('clientPlace').value = client.place;
        document.getElementById('clientMapLocation').value = client.mapLocation || '';
        document.getElementById('clientDays').value = client.totalDays;
    } else {
        title.textContent = 'Add Client';
        form.reset();
        document.getElementById('clientId').value = '';
    }
    
    modal.style.display = 'block';
}

// Save client
async function saveClient(e) {
    e.preventDefault();
    const address = document.getElementById('clientAddress').value;
    const mapLocationInput = document.getElementById('clientMapLocation').value.trim();
    
    // Generate Google Maps URL if not provided
    let mapLocation = mapLocationInput;
    if (!mapLocation) {
        // Auto-generate from address
        const encodedAddress = encodeURIComponent(address);
        mapLocation = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    } else if (!mapLocation.startsWith('http')) {
        // If it's just an address, convert to Google Maps URL
        const encodedAddress = encodeURIComponent(mapLocation);
        mapLocation = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    }
    
    const formData = {
        name: document.getElementById('clientName').value,
        phone: document.getElementById('clientPhone').value,
        address: address,
        place: document.getElementById('clientPlace').value,
        mapLocation: mapLocation,
        totalDays: parseInt(document.getElementById('clientDays').value) || 0,
        remainingDays: parseInt(document.getElementById('clientDays').value) || 0
    };
    
    const clientId = document.getElementById('clientId').value;
    
    try {
        const url = clientId ? `/clients/${clientId}` : '/clients';
        const method = clientId ? 'PUT' : 'POST';
        
        const response = await apiRequest(url, {
            method,
            body: JSON.stringify(formData)
        });
        
        if (response && response.ok) {
            document.getElementById('clientModal').style.display = 'none';
            await loadClients();
        }
    } catch (error) {
        alert('Error saving client: ' + error.message);
    }
}

// Edit client
function editClient(id) {
    const client = clients.find(c => c._id === id);
    if (client) openClientModal(client);
}

// Open delete client modal
function deleteClient(id) {
    const client = clients.find(c => c._id === id);
    if (!client) return;
    
    document.getElementById('deleteClientId').value = id;
    document.getElementById('deletePassword').value = '';
    document.getElementById('deleteError').textContent = '';
    document.getElementById('deleteError').classList.remove('show');
    document.getElementById('deleteClientModal').style.display = 'block';
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('deleteClientModal').style.display = 'none';
    document.getElementById('deletePassword').value = '';
    document.getElementById('deleteError').textContent = '';
    document.getElementById('deleteError').classList.remove('show');
}

// Delete client with password verification
async function confirmDeleteClient(e) {
    e.preventDefault();
    const clientId = document.getElementById('deleteClientId').value;
    const password = document.getElementById('deletePassword').value;
    const errorDiv = document.getElementById('deleteError');
    
    if (!password) {
        errorDiv.textContent = 'Password is required';
        errorDiv.classList.add('show');
        return;
    }
    
    try {
        // Verify password first
        const verifyResponse = await apiRequest('/verify-password', {
            method: 'POST',
            body: JSON.stringify({ password })
        });
        
        if (!verifyResponse) return;
        
        if (!verifyResponse.ok) {
            const error = await verifyResponse.json();
            errorDiv.textContent = error.error || 'Invalid password';
            errorDiv.classList.add('show');
            return;
        }
        
        // Password verified, proceed with deletion
        const deleteResponse = await apiRequest(`/clients/${clientId}`, { 
            method: 'DELETE' 
        });
        
        if (deleteResponse && deleteResponse.ok) {
            closeDeleteModal();
            await loadClients();
        }
    } catch (error) {
        errorDiv.textContent = 'Error deleting client: ' + error.message;
        errorDiv.classList.add('show');
    }
}

// Open add days modal
function openAddDaysModal(clientId) {
    document.getElementById('addDaysClientId').value = clientId;
    document.getElementById('addDaysModal').style.display = 'block';
}

// Add days
async function addDays(e) {
    e.preventDefault();
    const clientId = document.getElementById('addDaysClientId').value;
    const days = parseInt(document.getElementById('daysToAdd').value);
    
    try {
        const response = await apiRequest(`/clients/${clientId}/add-days`, {
            method: 'POST',
            body: JSON.stringify({ days })
        });
        
        if (response && response.ok) {
            document.getElementById('addDaysModal').style.display = 'none';
            await loadClients();
            if (currentClientId === clientId) {
                await loadClientCalendar(clientId);
            }
        }
    } catch (error) {
        alert('Error adding days: ' + error.message);
    }
}

// Show clients view
function showClientsView() {
    document.getElementById('clientsView').classList.add('active');
    document.getElementById('calendarView').classList.remove('active');
    currentClientId = null;
}

// Show calendar view
function showCalendarView() {
    document.getElementById('clientsView').classList.remove('active');
    document.getElementById('calendarView').classList.add('active');
}

// Open calendar
function openCalendar(clientId) {
    currentClientId = clientId;
    showCalendarView();
    loadClientCalendar(clientId);
}

// Load client calendar
async function loadClientCalendar(clientId) {
    try {
        const response = await apiRequest(`/clients/${clientId}`);
        if (!response) return;
        const client = await response.json();
        
        displayClientInfo(client);
        renderCalendar(client);
    } catch (error) {
        console.error('Error loading calendar:', error);
    }
}

// Display client info
function displayClientInfo(client) {
    const mapUrl = client.mapLocation || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.address)}`;
    const infoDiv = document.getElementById('clientInfo');
    infoDiv.innerHTML = `
        <h3>${client.name}</h3>
        <p><strong>Phone:</strong> ${client.phone}</p>
        <p><strong>Address:</strong> ${client.address}</p>
        <p><strong>Place:</strong> ${client.place}</p>
        <p><strong>Total Days:</strong> ${client.totalDays} | <strong>Remaining Days:</strong> ${client.remainingDays}</p>
        <p style="margin-top: 15px;">
            <a href="${mapUrl}" target="_blank" class="map-link">
                📍 Open in Google Maps
            </a>
        </p>
    `;
}

// Render calendar
function renderCalendar(client) {
    const container = document.getElementById('calendarContainer');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    let html = `
        <div class="calendar-header">
            <button class="calendar-nav" onclick="changeMonth(-1)">← Prev</button>
            <h2>${monthNames[month]} ${year}</h2>
            <button class="calendar-nav" onclick="changeMonth(1)">Next →</button>
        </div>
        <div class="calendar-grid">
    `;
    
    // Day headers
    dayNames.forEach(day => {
        html += `<div class="calendar-day-header">${day}</div>`;
    });
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        html += `<div class="calendar-day other-month"></div>`;
    }
    
    // Days of month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const record = client.foodRecords.find(r => r.date === dateStr);
        const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
        
        let classes = 'calendar-day';
        if (isToday) classes += ' today';
        if (record) {
            classes += record.status === 'received' ? ' received' : ' not-received';
        }
        
        html += `
            <div class="${classes}" onclick="toggleFoodStatus('${dateStr}')">
                <div class="calendar-day-number">${day}</div>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Change month
function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    if (currentClientId) {
        loadClientCalendar(currentClientId);
    }
}

// Toggle food status
async function toggleFoodStatus(dateStr) {
    if (!currentClientId) return;
    
    try {
        const response = await apiRequest(`/clients/${currentClientId}`);
        if (!response) return;
        const client = await response.json();
        
        const record = client.foodRecords.find(r => r.date === dateStr);
        let newStatus;
        
        // Determine new status
        if (!record) {
            newStatus = 'received';
        } else if (record.status === 'received') {
            newStatus = 'not_received';
        } else {
            newStatus = 'received';
        }
        
        // Check if trying to mark as received when no days remaining
        if (newStatus === 'received' && client.remainingDays <= 0) {
            alert('No days remaining! Please add days first before marking food as received.');
            return;
        }
        
        const updateResponse = await apiRequest(`/clients/${currentClientId}/food-status`, {
            method: 'POST',
            body: JSON.stringify({ date: dateStr, status: newStatus })
        });
        
        if (updateResponse && updateResponse.ok) {
            await loadClientCalendar(currentClientId);
            await loadClients();
        }
    } catch (error) {
        alert('Error updating food status: ' + error.message);
    }
}

// Make functions global
window.openCalendar = openCalendar;
window.openAddDaysModal = openAddDaysModal;
window.editClient = editClient;
window.deleteClient = deleteClient;
window.closeDeleteModal = closeDeleteModal;
window.changeMonth = changeMonth;
window.toggleFoodStatus = toggleFoodStatus;
