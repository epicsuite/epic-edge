const Structure = require('../models/structure');

const getStructure = (code, type, user) => new Promise((resolve, reject) => {
  // Use $eq to prevent query selector injections
  Structure.findOne({
    'status': { $ne: 'delete' }, 'code': { $eq: code }
  }).then((structure) => {
    if (structure === null) {
      resolve(null);
    }
    if (type === 'admin') {
      resolve(structure);
    }
    if (type === 'user' && (structure.owner === user.email || structure.sharedTo.includes(user.email) || structure.public)) {
      resolve(structure);
    } else if (type === 'public' && structure.public) {
      resolve(structure);
    } else {
      resolve(null);
    }
  }).catch((err) => { reject(err); });
});

const updateStructure = (query, req) => new Promise((resolve, reject) => {
  Structure.findOne(query).then((oldStructure) => {
    const structure = oldStructure;
    if (!structure) {
      resolve(null);
    } else {
      if (req.body.status) {
        structure.status = req.body.status;
      }
      if ('public' in req.body) {
        structure.public = req.body.public;
      }
      if (req.body.sharedTo) {
        structure.sharedTo = req.body.sharedTo;
      }

      structure.updated = Date.now();
      structure.save().then((updatedStructure) => {
        resolve(updatedStructure);
      }).catch((err) => { reject(err); });
    }
  }).catch((err) => { reject(err); });
});

module.exports = {
  getStructure,
  updateStructure,
};
