const randomize = require('randomatic');
const fs = require('fs');
const yaml = require('js-yaml');
const Dataset = require('../models/dataset');
const { getDataset, updateDataset } = require('../utils/dataset');
const logger = require('../../utils/logger');

const sysError = process.env.API_ERROR;

// Create a dataset
const addOne = async (req, res) => {
  try {
    const data = req.body;
    logger.debug(`/api/auth-user/datasets add: ${JSON.stringify(data)}`);
    // generate dataset code and create dataset home
    let code = randomize('Aa0', 16);
    let datasetHome = `${process.env.DATASET_HOME}/${code}`;
    while (fs.existsSync(datasetHome)) {
      code = randomize('Aa0', 16);
      datasetHome = `${process.env.DATASET_HOME}/${code}`;
    }

    const productId = data.id;
    const desc = data.desc;

    // validate input id
    const productHome = `${process.env.PRODUCT_HOME}/${productId}`;
    if (!fs.existsSync(productHome)) {
      throw new Error('Dataset not found.');
    }
    // get metadata from productHome/meta.yml
    // Get document, or throw exception on error
    let metadata = {};
    try {
      metadata = yaml.load(fs.readFileSync(`${productHome}/meta.yml`, 'utf8'));
    } catch (e) {
      throw new Error('File meta.yml not found in dataset.');
    }
    // add link in io/datasets to product dataset
    fs.symlinkSync(productHome, datasetHome, 'file');

    const newDataset = new Dataset({
      productId: productId,
      desc: desc,
      metadata: metadata,
      owner: req.user.email,
      code
    });
    const dataset = await newDataset.save();
    return res.send({
      dataset,
      message: 'Action successful',
      success: true,
    });

  } catch (err) {
    logger.error(`Add dataset failed: ${err}`);

    return res.status(500).json({
      error: `${err}`,
      message: sysError,
      success: false,
    });
  }
};

// Get dataset
const getOne = async (req, res) => {
  try {
    logger.debug(`/api/auth-user/datasets get: ${req.params.code}`);
    // find the dataset owned by user or shared to user or public
    const dataset = await getDataset(req.params.code, 'user', req.user);

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
    logger.error(`Get dataset failed: ${err}`);

    return res.status(500).json({
      message: sysError,
      success: false,
    });
  }
};

// Update dataset
const updateOne = async (req, res) => {
  try {
    logger.debug(`/api/auth-user/datasets update: ${req.params.code}`);
    const query = { code: { $eq: req.params.code }, 'status': { $ne: 'delete' }, 'owner': { $eq: req.user.email } };
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
    logger.error(`Update dataset failed: ${err}`);

    return res.status(500).json({
      message: sysError,
      success: false,
    });
  }
};

// Find all datasets owned by user
const getOwn = async (req, res) => {
  try {
    logger.debug(`/api/auth-user/datasets: ${req.user.email}`);
    const datasets = await Dataset.find({ 'status': { $ne: 'delete' }, 'owner': { $eq: req.user.email } }).sort([['productId', 1]]);

    return res.send({
      datasets,
      message: 'Action successful',
      success: true,
    });
  } catch (err) {
    logger.error(`List user datasets failed: ${err}`);
    return res.status(500).json({
      message: sysError,
      success: false,
    });
  }
};

// Find all datasets that user can access to
const getAll = async (req, res) => {
  try {
    logger.debug(`/api/auth-user/datasets/all: ${req.user.email}`);
    const datasets = await Dataset.find({ 'status': { $ne: 'delete' }, $or: [{ 'owner': { $eq: req.user.email } }, { 'sharedTo': req.user.email }, { 'public': true }] }).sort([['productId', 1]]);

    return res.send({
      datasets,
      message: 'Action successful',
      success: true,
    });
  } catch (err) {
    logger.error(`List all datasets failed: ${err}`);
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
