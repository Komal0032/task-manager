const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const getUserId = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    return null;
  }
};

// GET all team members
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const userId = getUserId(token);
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const members = await TeamMember.find({});
    console.log('✅ Team members fetched:', members.length);
    res.json({ success: true, members });
  } catch (error) {
    console.error('GET error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADD team member
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const userId = getUserId(token);
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const { name, email, role, password } = req.body;
    
    // Check if member already exists
    const existingMember = await TeamMember.findOne({ email });
    if (existingMember) {
      return res.status(400).json({ success: false, message: 'Member already exists' });
    }
    
    // Register user in User collection for login
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'member123', salt);
    
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'Member'
    });
    await newUser.save();
    
    // Add to team members collection
    const member = new TeamMember({
      name,
      email,
      role: role || 'Member',
      avatar: name.charAt(0).toUpperCase(),
      status: 'offline',
      addedBy: userId
    });
    
    await member.save();
    console.log('✅ Team member added:', member.email);
    res.status(201).json({ success: true, member });
  } catch (error) {
    console.error('POST error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE team member role
router.put('/:id', async (req, res) => {
  try {
    const { role } = req.body;
    const member = await TeamMember.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    
    // Also update role in User collection
    await User.findOneAndUpdate({ email: member.email }, { role });
    
    console.log('✅ Member role updated:', member.email, '->', role);
    res.json({ success: true, member });
  } catch (error) {
    console.error('PUT error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE team member
router.delete('/:id', async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    
    // Remove from User collection
    await User.findOneAndDelete({ email: member.email });
    
    // Remove from TeamMember collection
    await TeamMember.findByIdAndDelete(req.params.id);
    
    console.log('✅ Team member deleted:', member.email);
    res.json({ success: true, message: 'Member deleted' });
  } catch (error) {
    console.error('DELETE error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;