const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodtracking';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// User schema (must match setup.js)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'delivery'], required: true }
});
const User = mongoose.model('User', userSchema);

// Client schema
const foodRecordSchema = new mongoose.Schema({
  date: { type: String, required: true },
  status: { type: String, enum: ['received', 'not_received'], required: true }
}, { _id: false });

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  place: { type: String, default: '' },
  mapLocation: { type: String, default: '' },
  totalDays: { type: Number, default: 0 },
  remainingDays: { type: Number, default: 0 },
  foodRecords: { type: [foodRecordSchema], default: [] }
});
const Client = mongoose.model('Client', clientSchema);

// Auth middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// POST /api/login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/verify-password (admin only, for delete confirmation)
app.post('/api/verify-password', authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }
    const user = await User.findById(req.user.id);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('Verify password error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// GET /api/clients
app.get('/api/clients', authMiddleware, async (req, res) => {
  try {
    const clients = await Client.find().lean();
    res.json(clients);
  } catch (err) {
    console.error('Get clients error:', err);
    res.status(500).json({ error: 'Failed to load clients' });
  }
});

// GET /api/places
app.get('/api/places', authMiddleware, async (req, res) => {
  try {
    const places = await Client.distinct('place').then(arr => arr.filter(Boolean).sort());
    res.json(places);
  } catch (err) {
    console.error('Get places error:', err);
    res.status(500).json({ error: 'Failed to load places' });
  }
});

// POST /api/clients
app.post('/api/clients', authMiddleware, async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    console.error('Create client error:', err);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// GET /api/clients/:id
app.get('/api/clients/:id', authMiddleware, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).lean();
    if (!client) return res.status(404).json({ error: 'Client not found' });
    if (!client.foodRecords) client.foodRecords = [];
    res.json(client);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Client not found' });
    console.error('Get client error:', err);
    res.status(500).json({ error: 'Failed to load client' });
  }
});

// PUT /api/clients/:id
app.put('/api/clients/:id', authMiddleware, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Client not found' });
    console.error('Update client error:', err);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// DELETE /api/clients/:id
app.delete('/api/clients/:id', authMiddleware, async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json({ message: 'Client deleted' });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Client not found' });
    console.error('Delete client error:', err);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// POST /api/clients/:id/add-days
app.post('/api/clients/:id/add-days', authMiddleware, async (req, res) => {
  try {
    const { days } = req.body;
    const numDays = parseInt(days, 10);
    if (isNaN(numDays) || numDays < 1) {
      return res.status(400).json({ error: 'Valid days count required' });
    }
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { $inc: { totalDays: numDays, remainingDays: numDays } },
      { new: true }
    );
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Client not found' });
    console.error('Add days error:', err);
    res.status(500).json({ error: 'Failed to add days' });
  }
});

// POST /api/clients/:id/food-status
app.post('/api/clients/:id/food-status', authMiddleware, async (req, res) => {
  try {
    const { date, status } = req.body;
    if (!date || !['received', 'not_received'].includes(status)) {
      return res.status(400).json({ error: 'Valid date and status (received/not_received) required' });
    }
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const records = client.foodRecords || [];
    const existing = records.find(r => r.date === date);
    const prevStatus = existing ? existing.status : null;

    if (existing) {
      existing.status = status;
    } else {
      records.push({ date, status });
    }

    // Only change remainingDays when toggling: received uses a day, not_received returns it
    if (prevStatus !== status) {
      if (status === 'received') {
        client.remainingDays = Math.max(0, (client.remainingDays || 0) - 1);
      } else {
        client.remainingDays = (client.remainingDays || 0) + 1;
      }
    }
    client.foodRecords = records;
    await client.save();
    res.json(client);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Client not found' });
    console.error('Food status error:', err);
    res.status(500).json({ error: 'Failed to update food status' });
  }
});

// Connect and start
async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();
