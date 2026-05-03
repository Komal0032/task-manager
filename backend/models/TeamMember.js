const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['Admin', 'Member', 'Viewer'], default: 'Member' },
  status: { type: String, default: 'offline' },
  avatar: { type: String },
  addedBy: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TeamMember', teamMemberSchema);