const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');

// Get user from token
const getUserId = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    return null;
  }
};

// GET all tasks
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const userId = getUserId(token);
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const tasks = await Task.find({});
    console.log('✅ Tasks fetched:', tasks.length);
    res.json({ success: true, tasks });
  } catch (error) {
    console.error('GET error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE task
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const userId = getUserId(token);
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const { title, description, assignedTo, dueDate, priority, status } = req.body;
    
    console.log('📝 Creating task:', { title, assignedTo, dueDate });
    
    const task = new Task({
      title,
      description,
      assignedTo,
      assignedBy: userId,
      dueDate: new Date(dueDate),
      priority: priority || 'Medium',
      status: status || 'Todo'
    });
    
    await task.save();
    console.log('✅ Task created:', task._id);
    res.status(201).json({ success: true, task });
  } catch (error) {
    console.error('POST error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE task status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    console.log('✅ Task status updated:', task._id, '->', status);
    res.json({ success: true, task });
  } catch (error) {
    console.error('PATCH error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    console.log('✅ Task deleted:', req.params.id);
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    console.error('DELETE error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;