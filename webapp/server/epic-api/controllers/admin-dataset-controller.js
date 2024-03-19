const Dataset = require('../models/dataset');
const { updateDataset } = require('../utils/dataset');
const logger = require('../../utils/logger');

const sysError = process.env.API_ERROR;

// Update dataset
const updateOne = async (req, res) => {
  try {
    logger.debug(`/api/admin/datasets/${req.params.code} update`);

    const query = { 'status': { $ne: 'delete' }, code: { $eq: req.params.code } };
    const dataset = await updateDataset(query, req);

    if (!dataset) {
      logger.error(`dataset ${req.params.code} not found or access denied.`);
      return res.status(400).json({
        error: { dataset: `dataset ${req.params.code} not found or access denied` },
        message: 'Action failed',
        success: false,
      });
    }
    return res.send({
      dataset,
      message: 'Action successful',
      success: true,
    });
  } catch (err) {
    logger.error(`Admin update dataset failed: ${err}`);

    return res.status(500).json({
      message: sysError,
      success: false,
    });
  }
};

// Find all datasets
const getAll = async (req, res) => {
  try {
    logger.debug('/api/admin/datasets');
    // find all datasets
    const datasets = await Dataset.find({ 'status': { $ne: 'delete' } }).sort([['updated', -1]]);

    return res.json({
      datasets,
      message: 'Action successful',
      success: true,
    });

  } catch (err) {
    logger.error(`Admin get datasets failed: ${err}`);
    return res.status(500).json({
      message: sysError,
      success: false,
    });
  }
};

module.exports = {
  updateOne,
  getAll,
};
