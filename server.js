const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodtracking';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err));

// Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'delivery'], required: true }
});

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  place: { type: String, required: true },
  mapLocation: { type: String, default: '' },
  totalDays: { type: Number, default: 0 },
  remainingDays: { type: Number, default: 0 },
  foodRecords: [{
    date: { type: String, required: true },
    status: { type: String, enum: ['received', 'not_received'], required: true }
  }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Client = mongoose.model('Client', clientSchema);

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes
// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all clients (for delivery - can view, admin - full access)
app.get('/api/clients', authenticateToken, async (req, res) => {
  try {
    const clients = await Client.find().sort({ place: 1, name: 1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get client by ID
app.get('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add client (admin only)
app.post('/api/clients', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const client = new Client(req.body);
    await client.save();
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update client (admin only)
app.put('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify admin password
app.post('/api/verify-password', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const { password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }
    
    res.json({ verified: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete client (admin only)
app.delete('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: 'Client deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark food status for a date (admin only)
app.post('/api/clients/:id/food-status', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const { date, status } = req.body;
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    
    // Find existing record for this date
    const existingRecord = client.foodRecords.find(r => r.date === date);
    const previousStatus = existingRecord ? existingRecord.status : null;
    
    // Remove existing record for this date if any
    client.foodRecords = client.foodRecords.filter(r => r.date !== date);
    
    // Add new record
    client.foodRecords.push({ date, status });
    
    // Update remaining days based on status change
    if (status === 'received') {
      // Marking as received (green)
      // Only reduce if it wasn't already marked as received
      if (previousStatus !== 'received' && client.remainingDays > 0) {
        client.remainingDays -= 1;
      }
    } else if (status === 'not_received') {
      // Marking as not received (red)
      // If it was previously received, add back the day
      if (previousStatus === 'received') {
        // Add back the day, but don't exceed totalDays
        if (client.remainingDays < client.totalDays) {
          client.remainingDays += 1;
        }
      }
      // If it was already not_received or no previous record, no change
    }
    
    await client.save();
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add days to client (admin only)
app.post('/api/clients/:id/add-days', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const { days } = req.body;
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    
    client.totalDays += parseInt(days);
    client.remainingDays += parseInt(days);
    
    await client.save();
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get places list
app.get('/api/places', authenticateToken, async (req, res) => {
  try {
    const places = await Client.distinct('place');
    res.json(places);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
