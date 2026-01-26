// Setup script to create initial admin and delivery users
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodtracking';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'delivery'], required: true }
});

const User = mongoose.model('User', userSchema);

async function setup() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      username: 'admin',
      password: adminPassword,
      role: 'admin'
    });
    
    // Create delivery user
    const deliveryPassword = await bcrypt.hash('delivery123', 10);
    const delivery = new User({
      username: 'delivery',
      password: deliveryPassword,
      role: 'delivery'
    });
    
    // Check if users exist
    const existingAdmin = await User.findOne({ username: 'admin' });
    const existingDelivery = await User.findOne({ username: 'delivery' });
    
    if (!existingAdmin) {
      await admin.save();
      console.log('Admin user created: username=admin, password=admin123');
    } else {
      console.log('Admin user already exists');
    }
    
    if (!existingDelivery) {
      await delivery.save();
      console.log('Delivery user created: username=delivery, password=delivery123');
    } else {
      console.log('Delivery user already exists');
    }
    
    console.log('Setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Setup error:', error);
    process.exit(1);
  }
}

setup();
