const m2s = require('mongoose-to-swagger');
const User = require('../../edge-api/models/user');
const Structure = require('../models/structure');

module.exports = {
  user: m2s(User, { omitFields: ['_id', 'oauth', 'notification', 'job'] }),
  structure: m2s(Structure, { omitFields: ['_id'] }),
};
