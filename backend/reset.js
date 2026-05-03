const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function reset() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected');
    
    // Drop database
    await mongoose.connection.db.dropDatabase();
    console.log('Database dropped');
    
    const User = require('./models/User');
    
    // Create admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'Admin'
    });
    
    // Create member
    const memberPassword = await bcrypt.hash('member123', 10);
    await User.create({
      name: 'Member User',
      email: 'member@example.com',
      password: memberPassword,
      role: 'Member'
    });
    
    console.log('✅ Users created!');
    console.log('Admin: admin@example.com / admin123');
    console.log('Member: member@example.com / member123');
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

reset();