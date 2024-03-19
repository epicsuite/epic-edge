const fs = require('fs');
const Dataset = require('../models/dataset');

const getDataset = (code, type, user) => new Promise((resolve, reject) => {
  // Use $eq to prevent query selector injections
  Dataset.findOne({
    'status': { $ne: 'delete' }, 'code': { $eq: code }
  }).then((dataset) => {
    if (dataset === null) {
      resolve(null);
    }
    if (type === 'admin') {
      resolve(dataset);
    }
    if (type === 'user' && (dataset.owner === user.email || dataset.sharedTo.includes(user.email) || dataset.public)) {
      resolve(dataset);
    } else if (type === 'public' && dataset.public) {
      resolve(dataset);
    } else {
      resolve(null);
    }
  }).catch((err) => { reject(err); });
});

const updateDataset = (query, req) => new Promise((resolve, reject) => {
  Dataset.findOne(query).then((oldDataset) => {
    const dataset = oldDataset;
    if (!dataset) {
      resolve(null);
    } else {
      if (req.body.desc) {
        dataset.desc = req.body.desc;
      }
      if (req.body.status) {
        dataset.status = req.body.status;
      }
      if ('public' in req.body) {
        dataset.public = req.body.public;
      }
      if (req.body.sharedTo) {
        dataset.sharedTo = req.body.sharedTo;
      }

      dataset.updated = Date.now();
      dataset.save().then((updatedDataset) => {
        resolve(updatedDataset);
      }).catch((err) => { reject(err); });
    }
  }).catch((err) => { reject(err); });
});

module.exports = {
  getDataset,
  updateDataset,
};
