const m2s = require('mongoose-to-swagger');
const User = require('../../edge-api/models/user');
const Dataset = require('../../epic-api/models/dataset');
const Session = require('../../epic-api/models/session');
const Structure = require('../../epic-api/models/structure');

module.exports = {
  user: m2s(User, { omitFields: ['_id', 'oauth', 'notification', 'job'] }),
  dataset: m2s(Dataset, { omitFields: ['_id'] }),
  //session: m2s(Session, { omitFields: ['_id', 'sharedTo'] }),
  structure: m2s(Structure, { omitFields: ['_id'] }),
};
