const mongoose = require('mongoose');
const { structureStatus } = require('../utils/conf');

// Create Schema
const structureSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    description: 'unique string created by the 4DGB tool',
  },
  productId: {
    type: String,
    required: true,
    description: 'structure product id created by the 4DGB tool',
    trim: true,
  },
  chromosome: {
    type: String,
    required: true,
    description: 'chromosome',
    trim: true,
  },
  resolution: {
    type: String,
    required: true,
    description: 'resolution',
    trim: true,
  },
  metadata: {
    type: Object,
    required: true,
    description: 'structure meta.yml in json format, created by api',
  },
  status: {
    type: String,
    default: structureStatus[0],
    enum: structureStatus,
    description: 'used for marking structure for deletion',
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

module.exports = mongoose.model('structure', structureSchema);
