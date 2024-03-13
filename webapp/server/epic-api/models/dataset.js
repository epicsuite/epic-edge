const mongoose = require('mongoose');
const { datasetStatus } = require('../utils/conf');

// Create Schema
const datasetSchema = new mongoose.Schema({
  // Before insert new dataset to DB, the api will generate a code and link it to products/<product id> directory in the <IO>/datasets.
  code: {
    type: String,
    required: true,
    unique: true,
    description: 'unique string generated by api',
  },
  productId: {
    type: String,
    required: true,
    // allow duplicated datasets in DB before we know how to connect a dataset with a user.
    // unique: true,
    description: 'dataset product id created by the 4DGB tool',
    trim: true,
  },
  desc: {
    type: String,
    description: 'dataset description, input from user',
    trim: true,
  },
  metadata: {
    type: Object,
    required: true,
    description: 'dataset meta.yml in json format, created by api',
  },
  status: {
    type: String,
    default: datasetStatus[0],
    enum: datasetStatus,
    description: 'used for marking dataset for deletion',
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

module.exports = mongoose.model('dataset', datasetSchema);
