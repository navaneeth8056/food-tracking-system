// Delivery dashboard functionality
let clients = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    await loadClients();
    await loadPlaces();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Place filter
    document.getElementById('placeFilter').addEventListener('change', filterClients);
    
    // Modal close
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('clientDetailsModal').style.display = 'none';
    });
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
    
    container.innerHTML = filtered.map(client => `
        <div class="client-card" onclick="showClientDetails('${client._id}')">
            <h3>${client.name}</h3>
            <p><strong>Place:</strong> ${client.place}</p>
            <p><strong>Remaining Days:</strong> ${client.remainingDays}</p>
        </div>
    `).join('');
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

// Show client details
async function showClientDetails(clientId) {
    const client = clients.find(c => c._id === clientId);
    if (!client) return;
    
    document.getElementById('clientDetailsName').textContent = client.name;
    document.getElementById('clientDetailsPhone').textContent = client.phone;
    document.getElementById('clientDetailsAddress').textContent = client.address;
    document.getElementById('clientDetailsPlace').textContent = client.place;
    
    document.getElementById('clientDetailsModal').style.display = 'block';
}

// Make function global
window.showClientDetails = showClientDetails;
