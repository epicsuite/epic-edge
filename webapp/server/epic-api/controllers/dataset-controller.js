const Dataset = require('../models/dataset');
const { getDataset } = require('../utils/dataset');
const logger = require('../../utils/logger');

const sysError = process.env.API_ERROR;

// Find all public datasets
const getAll = async (req, res) => {
  try {
    logger.debug('/api/public/datasets');
    const datasets = await Dataset.find({ status: { $ne: 'delete' }, public: true }, { sharedTo: 0 }).sort([['productId', 1]]);
    return res.json({
      datasets,
      message: 'Action successful',
      success: true,
    });
  } catch (err) {
    logger.error(`/api/public/datasets failed: ${err}`);
    return res.status(500).json({
      message: sysError,
      success: false,
    });
  }
};

// Find a public dataset by code
const getOne = async (req, res) => {
  try {
    logger.debug(`/api/public/datasets/${req.params.code}`);
    const dataset = await getDataset(req.params.code, 'public');
    if (!dataset) {
      logger.error(`dataset not found or access denied.`);
      return res.status(400).json({
        error: { dataset: `dataset not found or access denied` },
        message: 'Action failed',
        success: false,
      });
    }
    return res.json({
      dataset,
      message: 'Action successful',
      success: true,
    });
  } catch (err) {
    logger.error(`/api/public/datasets/${req.params.code} failed: ${err}`);
    return res.status(500).json({
      message: sysError,
      success: false,
    });
  }
};

module.exports = {
  getAll,
  getOne,
};
