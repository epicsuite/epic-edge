const randomize = require('randomatic');
const fs = require('fs');
const yaml = require('js-yaml');
const Structure = require('../models/structure');
const { getStructure, updateStructure } = require('../utils/structure');
const logger = require('../../utils/logger');

const sysError = process.env.API_ERROR;

// Create a structure
const addOne = async (req, res) => {
  try {
    const data = req.body;
    logger.debug(`/api/auth-user/structures add: ${JSON.stringify(data)}`);

    const productId = data.id;
    // validate input id
    const productHome = `${process.env.PRODUCT_HOME}/${productId}`;
    if (!fs.existsSync(productHome)) {
      throw new Error('Dataset not found.');
    }
    // get metadata from productHome/meta.yaml
    // Get document, or throw exception on error
    let metadata = {};
    try {
      metadata = yaml.load(fs.readFileSync(`${productHome}/meta.yaml`, 'utf8'));
    } catch (e) {
      throw new Error('File meta.yaml not found in structure.');
    }

    //find all structure-with-tracks.csv
    const sections = fs.readdirSync(`${productHome}/section`);
    sections.forEach(function (section) {
      if (fs.existsSync(`${productHome}/section/${section}/structure`)) {
        //get resolutions
        const resolutions = fs.readdirSync(`${productHome}/section/${section}/structure`);
        resolutions.forEach(function (resolution) {
          const structureFile = `${productHome}/section/${section}/structure/${resolution}/structure-with-tracks.csv`;
          if (fs.existsSync(structureFile)) {
            // generate structure code and create structure home
            let code = randomize('Aa0', 16);
            let structureHome = `${process.env.STRUCTURE_HOME}/${code}`;
            while (fs.existsSync(structureHome)) {
              code = randomize('Aa0', 16);
              structureHome = `${process.env.STRUCTURE_HOME}/${code}`;
            }
            fs.mkdirSync(structureHome);

            // add link in io/structures to product structure
            fs.symlinkSync(`${productHome}/meta.yaml`, `${structureHome}/meta.yaml`, 'file');
            fs.symlinkSync(structureFile, `${structureHome}/structure-with-tracks.csv`, 'file');
            // insert into DB
            const newStructure = new Structure({
              productId: productId,
              chromosome: section,
              resolution: resolution,
              metadata: metadata,
              owner: req.user.email,
              code
            });
            newStructure.save();
          }
        });
      }
    });
    return res.send({
      message: 'Action successful',
      success: true,
    });

  } catch (err) {
    logger.error(`Add structure failed: ${err}`);

    return res.status(500).json({
      error: `${err}`,
      message: sysError,
      success: false,
    });
  }
};

// Get structure
const getOne = async (req, res) => {
  try {
    logger.debug(`/api/auth-user/structures get: ${req.params.code}`);
    // find the structure owned by user or shared to user or public
    const structure = await getStructure(req.params.code, 'user', req.user);

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
    logger.error(`Get structure failed: ${err}`);

    return res.status(500).json({
      message: sysError,
      success: false,
    });
  }
};

// Update structure
const updateOne = async (req, res) => {
  try {
    logger.debug(`/api/auth-user/structures update: ${req.params.code}`);
    const query = { code: { $eq: req.params.code }, 'status': { $ne: 'delete' }, 'owner': { $eq: req.user.email } };
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
    logger.error(`Update structure failed: ${err}`);

    return res.status(500).json({
      message: sysError,
      success: false,
    });
  }
};

// Find all structures owned by user
const getOwn = async (req, res) => {
  try {
    logger.debug(`/api/auth-user/structures: ${req.user.email}`);
    const structures = await Structure.find({ 'status': { $ne: 'delete' }, 'owner': { $eq: req.user.email } }).sort([['structureId', 1]]);

    return res.send({
      structures,
      message: 'Action successful',
      success: true,
    });
  } catch (err) {
    logger.error(`List user structures failed: ${err}`);
    return res.status(500).json({
      message: sysError,
      success: false,
    });
  }
};

// Find all structures that user can access to
const getAll = async (req, res) => {
  try {
    logger.debug(`/api/auth-user/structures/all: ${req.user.email}`);
    const structures = await Structure.find({ 'status': { $ne: 'delete' }, $or: [{ 'owner': { $eq: req.user.email } }, { 'sharedTo': req.user.email }, { 'public': true }] }).sort([['structureId', 1]]);

    return res.send({
      structures,
      message: 'Action successful',
      success: true,
    });
  } catch (err) {
    logger.error(`List all structures failed: ${err}`);
    return res.status(500).json({
      message: sysError,
      success: false,
    });
  }
};

module.exports = {
  addOne,
  getOne,
  updateOne,
  getOwn,
  getAll,
};
