const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Fixed Admin Account (Only One)
const FIXED_ADMIN = {
  email: 'admin@taskpro.com',
  password: 'Admin@123',
  name: 'Super Admin',
  role: 'Admin'
};

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    console.log('Registration attempt:', { name, email, role });
    
    // Check if trying to register as admin
    if (role === 'Admin') {
      // Check if admin already exists
      const adminExists = await User.findOne({ role: 'Admin' });
      if (adminExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'Admin account already exists. Only one admin is allowed.' 
        });
      }
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user (always Member unless special case)
    let userRole = 'Member';
    // Allow first admin registration only if no admin exists
    if (role === 'Admin') {
      const adminCount = await User.countDocuments({ role: 'Admin' });
      if (adminCount === 0) {
        userRole = 'Admin';
      }
    }
    
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: userRole
    });
    
    await user.save();
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', email);
    
    // Check for fixed admin account first
    if (email === FIXED_ADMIN.email && password === FIXED_ADMIN.password) {
      // Check if admin exists in database
      let admin = await User.findOne({ email: FIXED_ADMIN.email });
      
      if (!admin) {
        // Create admin in database if not exists
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(FIXED_ADMIN.password, salt);
        admin = new User({
          name: FIXED_ADMIN.name,
          email: FIXED_ADMIN.email,
          password: hashedPassword,
          role: 'Admin'
        });
        await admin.save();
        console.log('Fixed admin account created');
      }
      
      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
      
      return res.json({
        success: true,
        token,
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: 'Admin'
        }
      });
    }
    
    // Regular user login
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

module.exports = router;