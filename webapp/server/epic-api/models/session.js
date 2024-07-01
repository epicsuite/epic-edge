const mongoose = require('mongoose');
const { sessionStatus } = require('../utils/conf');

// Create Schema
const sessionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    description: 'unique string generated by api',
  },
  name: {
    type: String,
    required: true,
    description: 'input from user',
    trim: true,
  },
  desc: {
    type: String,
    description: 'input from user',
    trim: true,
  },
  detail: {
    type: Object,
    required: true,
    description: 'session state json object',
  },
  status: {
    type: String,
    default: sessionStatus[0],
    enum: sessionStatus,
    description: 'used for marking session for deletion',
  },
  public: {
    type: Boolean,
    default: false,
    description: 'used for marking session for public access',
  },
  owner: {
    type: String,
    required: true,
  },
  sharedTo: [{
    type: String,
  }],
}, {
  timestamps: {
    createdAt: 'created', // Use `created` to store the created date
    updatedAt: 'updated', // and `updated` to store the last updated date
  },
});

module.exports = mongoose.model('session', sessionSchema);
