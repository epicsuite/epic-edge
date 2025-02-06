const logger = require('../../utils/logger');
const { getAllFiles } = require('../../utils/common');
const config = require('../../config');

const sysError = config.APP.API_ERROR;

// Find all public data
const getPublicFiles = async (req, res) => {
  try {
    logger.debug(`/api/public/data: ${JSON.stringify(req.body)}`);
    const dataDir = config.IO.PUBLIC_BASE_DIR;
    const files = getAllFiles(dataDir, [], req.body.fileTypes, 'publicdata', 'publicdata', dataDir);

    return res.send({
      fileData: files,
      message: 'Action successful',
      success: true,
    });
  } catch (err) {
    logger.error(`List public data failed: ${err}`);
    return res.status(500).json({
      message: sysError,
      success: false,
    });
  }
};

module.exports = {
  getPublicFiles,
};
