const Structure = require('../models/structure');
const { updateStructure } = require('../utils/structure');
const logger = require('../../utils/logger');

const sysError = process.env.API_ERROR;

// Update structure
const updateOne = async (req, res) => {
  try {
    logger.debug(`/api/admin/structures/${req.params.code} update`);

    const query = { 'status': { $ne: 'delete' }, code: { $eq: req.params.code } };
    const structure = await updateStructure(query, req);

    if (!structure) {
      logger.error(`structure ${req.params.code} not found or access denied.`);
      return res.status(400).json({
        error: { structure: `structure ${req.params.code} not found or access denied` },
        message: 'Action failed',
        success: false,
      });
    }
    return res.send({
      structure,
      message: 'Action successful',
      success: true,
    });
  } catch (err) {
    logger.error(`Admin update structure failed: ${err}`);

    return res.status(500).json({
      message: sysError,
      success: false,
    });
  }
};

// Find all structures
const getAll = async (req, res) => {
  try {
    logger.debug('/api/admin/structures');
    // find all structures
    const structures = await Structure.find({ 'status': { $ne: 'delete' } }).sort([['updated', -1]]);

    return res.json({
      structures,
      message: 'Action successful',
      success: true,
    });

  } catch (err) {
    logger.error(`Admin get structures failed: ${err}`);
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
