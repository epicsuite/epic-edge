const requestIp = require('request-ip')
const fs = require('fs');
const readline = require('readline');
const { exec, spawn } = require('child_process');
const logger = require('../../utils/logger');
const { getOne, addOne, updateOne, deleteOne } = require('../utils/trame');
const { trameApps } = require('../utils/conf');

const sysError = process.env.API_ERROR;

// Insert new user and send out activation link to user if user's status is not active
const trame = async (req, res) => {
  try {
    logger.debug('/trame: ' + JSON.stringify(req.body));
    let conf = req.body;
    let params = conf.params;
    if (typeof params === 'string') {
      params = JSON.parse(params);
    }
    logger.debug(params.structure)
    const clientIp = requestIp.getClientIp(req)
    logger.debug('client ip: ' + clientIp);
    const structureData = `${process.env.STRUCTURE_HOME}/${params.structure}/structure-with-tracks.csv`;
    let input = { ipAddress: clientIp, app: params.app, data: structureData };
    let trame = await getOne(input);
    // there is an active trame process for the selected structure dataset and app, return it
    if (trame) {
      // set updated time to new time
      await updateOne({ ipAddress: input.ipAddress });
      // return url
      const url = `${process.env.TRAME_BASE_URL}${trame.port}`;
      logger.debug('url:' + url);
      return res.json({
        success: true,
        url: url,
      });
    }

    // there is an active trame process for previouse dataset and app, delete it
    trame = await getOne({ ipAddress: input.ipAddress });
    // there is an active trame process for the selected structure dataset and app, return it
    if (trame) {
      // kill the process and delete the trame from DB
      exec(`kill -9 ${trame.pid}`, (error, stdout, stderr) => {
        if (error) {
          logger.error(error.message);
          //throw new Error(error.message);
        }
        if (stderr) {
          logger.error(stderr);
          //throw new Error(stderr);
        }
      });
      await deleteOne(input.ipAddress);
    }

    // get unique port
    let port = process.env.TRAME_PORT_START;
    while (port < process.env.TRAME_PORT_END && await getOne({ port: port }) !== null) {
      port++;
    }
    // check if port is available
    if (await getOne({ port: port }) !== null) {
      return res.status(400).json({
        success: false,
        message: 'The system is busy. Please try again later.'
      });
    }

    input.port = port;
    // find the track name, temp solution for now
    const firstLine = await readFirstLine(input.data);
    const track = firstLine.split(',')[4];
    let cmd = `${process.env.PYTHON} ${process.env.TRAME_APP_HOME}/${trameApps[input.app]} ${input.data} ${track} --server --port ${input.port}`;
    logger.info(cmd);
    const outLog = `${process.env.STRUCTURE_HOME}/${params.structure}/out.log`;
    let pid = execCmd(cmd, outLog);
    //run local
    if (pid) {
      input.pid = pid;
      await addOne(input);
      const url = `${process.env.TRAME_BASE_URL}${input.port}`;
      logger.info('trame ' + url);
      // wait for the trame server to be up running
      setTimeout(function () {
        return res.json({
          success: true,
          url: url,
        });
      }, 9000);
    } else {
      setTimeout(function () {
        return res.status(400).json({ success: false, errMessage: 'Failed to create trame instance.' });
      }, 3000);
    }
  } catch (err) {
    logger.error(`/api/public/trame failed: ${err}`);
    return res.status(500).json({
      message: sysError,
      success: false,
    });
  }
}

const execCmd = (cmd, outLog) => {
  let out = fs.openSync(outLog, 'a');
  let err = fs.openSync(outLog, 'a');
  const child = spawn(cmd, {
    shell: true, // have to use shell, otherwise the trame instance will be stopped when restarting the webapp
    stdio: ['ignore', out, err], // piping stdout and stderr to out.log
    detached: true,
  });
  console.log('child', child)
  child.unref();
  return child.pid;
}

const readFirstLine = async (path) => {
  const inputStream = fs.createReadStream(path);
  try {
    for await (const line of readline.createInterface(inputStream)) return line;
    return ''; // If the file is empty.
  }
  finally {
    inputStream.destroy(); // Destroy file stream.
  }
}

module.exports = {
  trame,
};
