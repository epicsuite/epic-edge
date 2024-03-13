const fs = require('fs');
const logger = require('../../utils/logger');
const { getAllFiles } = require('../../utils/common');

const sysError = process.env.API_ERROR;

// Find all public data
const getPublicFiles = async (req, res) => {
  try {
    logger.debug(`/api/auth-user/data/public: ${JSON.stringify(req.body)}`);
    const dataDir = process.env.PUBLIC_DATA_HOME;
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
// Find all user globus data
const getGlobusFiles = async (req, res) => {
  try {
    logger.debug(`/api/auth-user/data/globus: ${JSON.stringify(req.body)}`);
    const dataDir = `${process.env.GLOBUS_DATA_HOME}/${req.user.email}`;
    let files = [];
    if (fs.existsSync(dataDir)) {
      files = getAllFiles(dataDir, [], req.body.fileTypes, 'globus', 'globus', dataDir);
    }
    return res.send({
      fileData: files,
      message: 'Action successful',
      success: true,
    });
  } catch (err) {
    logger.error(`List globus data failed: ${err}`);
    return res.status(500).json({
      message: sysError,
      success: false,
    });
  }
};

module.exports = {
  getPublicFiles,
  getGlobusFiles,
};
