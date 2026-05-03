const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const jwt = require('jsonwebtoken');

const getUserId = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    return null;
  }
};

// GET all projects
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const userId = getUserId(token);
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const projects = await Project.find({});
    console.log('✅ Projects fetched:', projects.length);
    res.json({ success: true, projects });
  } catch (error) {
    console.error('GET error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE project
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const userId = getUserId(token);
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const { name, description } = req.body;
    
    const project = new Project({
      name,
      description,
      owner: userId,
      status: 'Active'
    });
    
    await project.save();
    console.log('✅ Project created:', project.name);
    res.status(201).json({ success: true, project });
  } catch (error) {
    console.error('POST error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE project
router.delete('/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    console.log('✅ Project deleted:', req.params.id);
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    console.error('DELETE error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;