const fs = require('fs');
const moment = require('moment');
const Upload = require('../edge-api/models/upload');
const logger = require('../utils/logger');

module.exports = function fileUploadMonitor() {
  logger.debug('file upload monitor');

  // delete file after deleteGracePeriod
  const deleteGracePeriod = moment().subtract(process.env.FILEUPLOAD_DELETE_GRACE_PERIOD, 'days');
  Upload.find({ 'status': 'delete', 'updated': { '$lte': deleteGracePeriod } }).then(uploads => {
    let i;
    for (i = 0; i < uploads.length; i += 1) {
      const { code } = uploads[i];
      // delete file
      const path = `${process.env.FILEUPLOAD_FILE_DIR}/${code}`;
      fs.unlink(path, (err) => {
        if (err) {
          logger.error(`Failed to delete ${path}:${err}`);
          return;
        }

        logger.info(`deleted ${path}`);
      });
      // delete from database
      Upload.deleteOne({ code }, (err) => {
        if (err) {
          logger.info(`Failed to delete upload ${code}:${err}`);
        }
      });
    }
  });

  // change status to 'delete' if upload is older than daysKept
  const daysKept = moment().subtract(process.env.FILEUPLOAD_DAYS_KEPT, 'days');
  Upload.find({ status: 'live', 'created': { '$lte': daysKept } }).then(uploads => {
    let i;
    for (i = 0; i < uploads.length; i += 1) {
      const { code } = uploads[i];
      logger.info(`mark file for deleting ${code}`);
      Upload.findOne({ code }).then(upload => {
        if (!upload) {
          logger.error(`Upload not found ${code}`);
        } else {
          upload.status = 'delete';
          upload.updated = Date.now();
          upload.save().then().catch(err => {
            logger.error(`Failed to update upload ${code}:${err}`);
          });
        }
      });
    }
  });
};
