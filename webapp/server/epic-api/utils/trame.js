const fs = require('fs');
const randomize = require('randomatic');
const readline = require('readline');
const { exec, spawn } = require('child_process');
const ejs = require('ejs');
const Trame = require('../models/trame');
const logger = require('../../utils/logger');
const { getStructure } = require('./structure');
const { trameCmds } = require('./conf');
const config = require('../../config');

const sysError = config.APP.API_ERROR;
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

const deleteByPort = (port, code) => new Promise((resolve, reject) => {
  Trame.deleteOne({ 'port': { $eq: port } }).then(() => {
    resolve(null);
  }).catch((err) => { reject(err); });
  const trameHome = `${config.EPIC.TRAME_BASE_DIR}/${code}`;
  if (fs.existsSync(trameHome)) {
    fs.rmSync(trameHome, { recursive: true, force: true });
  }
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

const pidIsRunning = (pid) => {
  try {
    // a signal of 0 can be used to test for the existence of a process.
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
};

// eslint-disable-next-line consistent-return
const startTrame = async (req, res, type) => {
  try {
    logger.debug(`/trame: ${JSON.stringify(req.body)}`);
    const conf = req.body;
    let { params } = conf;
    if (typeof params === 'string') {
      params = JSON.parse(params);
    }
    const trameApp = params.app;

    const input = { app: trameApp };
    if (type === 'user') {
      input.user = req.user.email;
    } else {
      input.user = 'public';
    }
    if (trameApp === 'structure') {
      logger.debug(params.structure);
      let structure = null;
      if (type === 'user') {
        structure = await getStructure(params.structure, 'user', req.user);
      } else {
        structure = await getStructure(params.structure, 'public');
      }
      if (!structure) {
        return res.status(400).json({
          success: false,
          message: 'You have no permission to access this dataset.'
        });
      }

      const structureData = `${config.EPIC.STRUCTURE_BASE_DIR}/${params.structure}/structure-with-tracks.csv`;
      input.data = structureData;
    } else if (trameApp === 'compare') {
      input.data = JSON.stringify(params.input);
    }
    let trameObj = await getOne(input);
    // there is an active trame process for the selected structure dataset and app, return it
    // only for type is user
    if (trameObj && type === 'user') {
      // set updated time to new time
      await updateOne({ port: trameObj.port });
      // return url
      const url = `${config.EPIC.TRAME_BASE_URL}${trameObj.port}`;
      logger.debug(`url:${url}`);
      if (pidIsRunning(trameObj.pid)) {
        return res.json({
          success: true,
          url,
        });
      }

      // don't await for it to complete or fail
      deleteByPort(trameObj.port, trameObj.code);
    }
    if (type === 'user') {
      // assumption: user can be allowed to have only 1 active trame instance
      // there is an active trame process for previouse dataset and app, delete it
      trameObj = await getOne({ user: input.user });
      if (trameObj) {
        // kill the process and delete the trame from DB
        if (pidIsRunning(trameObj.pid)) {
          exec(`kill -9 ${trameObj.pid}`, (error, stdout, stderr) => {
            if (error) {
              logger.error(error.message);
              // throw new Error(error.message);
            }
            if (stderr) {
              logger.error(stderr);
              // throw new Error(stderr);
            }
          });
        }

        // don't await for it to complete or fail
        deleteByPort(trameObj.port, trameObj.code);
      }
    }

    // get unique port
    let port = (type === 'user') ? config.EPIC.TRAME_USER_PORT_START : config.EPIC.TRAME_PUBLIC_PORT_START;
    // eslint-disable-next-line no-await-in-loop
    while (await getOne({ port }) !== null) {
      // eslint-disable-next-line no-plusplus
      port++;
    }

    // check if port is available
    if (port > (type === 'user' ? config.EPIC.TRAME_USER_PORT_END : config.EPIC.TRAME_PUBLIC_PORT_END)) {
      return res.status(400).json({
        success: false,
        message: 'The system is busy. Please try again later.'
      });
    }

    input.port = port;
    // generate command
    const values = {
      port: input.port,
    };
    // create trame directory
    let code = randomize('Aa0', 16);
    let trameHome = `${config.EPIC.TRAME_BASE_DIR}/${code}`;
    while (fs.existsSync(trameHome)) {
      code = randomize('Aa0', 16);
      trameHome = `${config.EPIC.TRAME_BASE_DIR}/${code}`;
    }
    fs.mkdirSync(trameHome);
    input.code = code;
    values.trameHome = trameHome;
    let outLog = `${trameHome}/tmp-${port}.log`;
    if (trameApp === 'structure') {
      // find the track name, temp solution for now
      const firstLine = await readFirstLine(input.data);
      const track = firstLine.split(',')[4];
      values.track = track;
      values.data = input.data;
      outLog = `${config.EPIC.STRUCTURE_BASE_DIR}/${params.structure}/out.log`;
    } else if (trameApp === 'compare') {
      values.leftfile = params.input.leftVtpFile;
      values.rightfile = params.input.rightVtpFile;
      // generate session.yaml and settings.yaml
      // generate trame code and create trame home
      const sessionYaml = `${trameHome}/session.yaml`;
      values.sessionYaml = sessionYaml;
      const template = String(fs.readFileSync(config.EPIC.COMPARE_TMPL));
      // render input template and write to session.yaml
      await fs.promises.writeFile(sessionYaml, ejs.render(template, values));
      // copy trame view settings to trame home
      await fs.promises.copyFile(config.EPIC.COMPARE_SETTINGS, `${trameHome}/settings.yaml`);
      outLog = `${trameHome}/compare-${input.port}.log`;
      input.data = JSON.stringify(params.input);
    }

    // render command
    const template = trameCmds[trameApp];
    const cmd = ejs.render(template, values);
    logger.info(cmd);
    const pid = execCmd(cmd, outLog);

    // run local
    if (pid) {
      input.pid = pid + 1;
      await addOne(input);
      const url = `${config.EPIC.TRAME_BASE_URL}${input.port}`;
      logger.info(`trame ${url}`);
      // wait for the trame server to be up running
      let duration = 3000;
      if (trameApp === 'compare') {
        duration = 50000;
      }
      setTimeout(() => res.json({
        success: true,
        url,
      }), duration);
    } else {
      setTimeout(() => res.status(400).json({ success: false, errMessage: 'Failed to create trame instance.' }), 3000);
    }
  } catch (err) {
    if (type === 'user') {
      logger.error(`/api/auth-user/trame failed: ${err}`);
    } else {
      logger.error(`/api/public/trame failed: ${err}`);
    }
    return res.status(500).json({
      message: sysError,
      success: false,
    });
  }
};

module.exports = {
  getOne,
  addOne,
  updateOne,
  deleteByPort,
  execCmd,
  readFirstLine,
  pidIsRunning,
  startTrame,
};
