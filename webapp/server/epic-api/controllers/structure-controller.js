const Structure = require('../models/structure');
const { getStructure } = require('../utils/structure');
const logger = require('../../utils/logger');
const config = require('../../config');

const sysError = config.APP.API_ERROR;

// Find all public structures
const getAll = async (req, res) => {
  try {
    logger.debug('/api/public/structures');
    const structures = await Structure.find({ status: { $ne: 'delete' }, public: true }, { sharedTo: 0 }).sort([['structureId', 1]]);
    return res.json({
      structures,
      message: 'Action successful',
      success: true,
    });
  } catch (err) {
    logger.error(`/api/public/structures failed: ${err}`);
    return res.status(500).json({
      message: sysError,
      success: false,
    });
  }
};

// Find a public structure by code
const getOne = async (req, res) => {
  try {
    logger.debug(`/api/public/structures/${req.params.code}`);
    const structure = await getStructure(req.params.code, 'public');
    if (!structure) {
      logger.error('structure not found or access denied.');
      return res.status(400).json({
        error: { structure: 'structure not found or access denied' },
        message: 'Action failed',
        success: false,
      });
    }
    return res.json({
      structure,
      message: 'Action successful',
      success: true,
    });
  } catch (err) {
    logger.error(`/api/public/structures/${req.params.code} failed: ${err}`);
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
