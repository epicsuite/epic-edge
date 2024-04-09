const Upload = require('../models/upload');

async function getRealName(dir) {
  let name = dir;
  // check if input is a uploaded file
  const upload = await Upload.findOne({ 'code': dir });

  if (upload) {
    name = upload.name;
  }
  return name;
}

const updateUpload = (query, req) => new Promise((resolve, reject) => {
  Upload.findOne(query).then(item => {
    if (!item) {
      resolve(null);
    } else {
      const upload = item;
      upload.name = req.body.name;
      upload.desc = req.body.desc;
      upload.folder = req.body.folder;
      upload.public = req.body.public;
      upload.sharedTo = req.body.sharedTo;
      if (req.body.status) {
        upload.status = req.body.status;
      }

      upload.updated = Date.now();
      upload.save().then(newupload => {
        resolve(newupload);
      }).catch(err => {
        reject(err);
      });
    }
  }).catch(err => { reject(err); });
});

const getUploadedSize = (owner) => new Promise((resolve, reject) => {
  // find size of all uploaded files owned by user
  Upload.aggregate([{
    $match: { $and: [{ 'status': { $ne: 'delete' }, 'owner': { $eq: owner } }] },
  }, {
    $group: {
      _id: null,
      total: {
        $sum: '$size'
      }
    }
  }], (err, result) => {
    let size = 0;
    if (err) {
      reject(err);
    } else if (result[0]) {
      size = result[0].total;
    }
    resolve(size);
  }).catch(err => { reject(err); });
});

const getUploadFolderOptions = (owner) => new Promise((resolve, reject) => {
  // get folder options
  Upload.distinct('folder', { 'status': { $ne: 'delete' }, 'owner': { $eq: owner } }).then((folders) => {
    const options = [];
    if (folders.length > 0) {
      folders.forEach(folder => {
        options.push({ value: folder, label: folder });
      });
    } else {
      options.push({ value: 'main', label: 'main' });
    }
    resolve(options);
  }).catch(err => { reject(err); });

});

module.exports = {
  getRealName,
  updateUpload,
  getUploadedSize,
  getUploadFolderOptions,
};
