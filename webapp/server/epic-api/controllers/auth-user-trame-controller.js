const { exec } = require('child_process');
const logger = require('../../utils/logger');
const { getOne, addOne, updateOne, deleteByPort, execCmd, readFirstLine, pidIsRunning } = require('../utils/trame');
const { getStructure } = require('../utils/structure');
const { trameApps } = require('../utils/conf');
const config = require('../../config');

const sysError = config.APP.API_ERROR;

// assumption: user can be allowed only 1 active trame instance
// eslint-disable-next-line consistent-return
const trame = async (req, res) => {
  try {
    logger.debug(`/trame: ${JSON.stringify(req.body)}`);
    const conf = req.body;
    let { params } = conf;
    if (typeof params === 'string') {
      params = JSON.parse(params);
    }
    logger.debug(params.structure);
    const structure = await getStructure(params.structure, 'user', req.user);
    if (!structure) {
      return res.status(400).json({
        success: false,
        message: 'You have no permission to access this dataset.'
      });
    }

    const structureData = `${config.EPIC.STRUCTURE_BASE_DIR}/${params.structure}/structure-with-tracks.csv`;
    const input = { user: req.user.email, app: params.app, data: structureData };
    let trameObj = await getOne(input);
    // there is an active trame process for the selected structure dataset and app, return it
    if (trameObj) {
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
      await deleteByPort(trameObj.port);
    }

    // there is an active trame process for previouse dataset and app, delete it
    trameObj = await getOne({ user: input.user });
    if (trameObj) {
      // kill the process and delete the trame from DB
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
      // delete trame from db
      await deleteByPort(trameObj.port);
    }

    // get unique port
    let port = config.EPIC.TRAME_PORT_START;
    // eslint-disable-next-line no-await-in-loop
    while (await getOne({ port }) !== null) {
      // eslint-disable-next-line no-plusplus
      port++;
    }

    // check if port is available
    if (port > config.EPIC.TRAME_PORT_END) {
      return res.status(400).json({
        success: false,
        message: 'The system is busy. Please try again later.'
      });
    }

    input.port = port;
    // find the track name, temp solution for now
    const firstLine = await readFirstLine(input.data);
    const track = firstLine.split(',')[4];
    const cmd = `${config.EPIC.PYTHON} ${config.EPIC.TRAME_APP_BASE_DIR}/${trameApps[input.app]} ${input.data} ${track} --server --port ${input.port} &`;
    logger.info(cmd);
    const outLog = `${config.EPIC.STRUCTURE_BASE_DIR}/${params.structure}/out.log`;
    const pid = execCmd(cmd, outLog);
    // run local
    if (pid) {
      input.pid = pid + 1;
      await addOne(input);
      const url = `${config.EPIC.TRAME_BASE_URL}${input.port}`;
      logger.info(`trame ${url}`);
      // wait for the trame server to be up running
      setTimeout(() => res.json({
        success: true,
        url,
      }), 3000);
    } else {
      setTimeout(() => res.status(400).json({ success: false, errMessage: 'Failed to create trame instance.' }), 3000);
    }
  } catch (err) {
    logger.error(`/api/auth-user/trame failed: ${err}`);
    return res.status(500).json({
      message: sysError,
      success: false,
    });
  }
};

module.exports = {
  trame,
};
