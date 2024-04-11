const Trame = require('../models/trame');

const getOne = (query) => new Promise((resolve, reject) => {
  Trame.findOne(query).then((trame) => {
    resolve(trame);
  }).catch((err) => { reject(err); });
});

const updateOne = (query) => new Promise((resolve, reject) => {
  Trame.findOne(query).then((oldTrame) => {
    const trame = oldTrame;
    if (!trame) {
      resolve(null);
    } else {
      trame.updated = Date.now();
      trame.save().then((updatedTrame) => {
        resolve(updatedTrame);
      }).catch((err) => { reject(err); });
    }
  }).catch((err) => { reject(err); });
});

const addOne = (input) => new Promise(async (resolve, reject) => {
  try {
    const newTrame = new Trame({ ...input });
    const trame = await newTrame.save();
    resolve(trame);
  } catch (err) {
    { reject(err); }
  }
});

const deleteOne = (ipAddress) => new Promise(async (resolve, reject) => {
  try {
    await Trame.deleteOne({ 'ipAddress': { $eq: ipAddress } });
    resolve(null);
  } catch (err) {
    { reject(err); }
  }
});

module.exports = {
  getOne,
  addOne,
  updateOne,
  deleteOne,
};
