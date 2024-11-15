const fs = require('fs');
const readline = require('readline');
const { spawn } = require('child_process');
const http = require('http');
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

const addOne = (input) => new Promise((resolve, reject) => {
  const trame = new Trame({ ...input });
  trame.save().then((newTrame) => {
    resolve(newTrame);
  }).catch((err) => { reject(err); });
});

const deleteByPort = (port) => new Promise((resolve, reject) => {
  Trame.deleteOne({ 'port': { $eq: port } }).then(() => {
    resolve(null);
  }).catch((err) => { reject(err); });
});

const execCmd = (cmd, outLog) => {
  const out = fs.openSync(outLog, 'a');
  const err = fs.openSync(outLog, 'a');
  const child = spawn(cmd, {
    shell: true, // have to use shell, otherwise the trame instance will be stopped when restarting the webapp
    stdio: ['ignore', out, err], // piping stdout and stderr to out.log
    detached: true,
  });

  child.unref();
  return child.pid;
};

const readFirstLine = async (path) => {
  const readable = fs.createReadStream(path);
  const reader = readline.createInterface({ input: readable });
  const line = await new Promise((resolve) => {
    reader.on('line', (fline) => {
      reader.close();
      resolve(fline);
    });
  });
  readable.close();
  return line;
};

const isGoodURL = async (url) => {
  http
    .get(url, () => true)
    .on('error', () => false);
};

module.exports = {
  getOne,
  addOne,
  updateOne,
  deleteByPort,
  execCmd,
  readFirstLine,
  isGoodURL,
};
