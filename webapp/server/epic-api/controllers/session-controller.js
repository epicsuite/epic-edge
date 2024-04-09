const randomize = require('randomatic');
const fs = require('fs');
const { exec } = require("child_process");
const logger = require('../../utils/logger');

const sysError = process.env.API_ERROR;

// Insert new user and send out activation link to user if user's status is not active
const trame = async (req, res) => {
  try {
    logger.debug("/trame: " + JSON.stringify(req.body));
    let conf = req.body;
    if (typeof conf.params === 'string') {
      conf.params = JSON.parse(conf.params);
    }

    let code = randomize('Aa0', 16);
    let output_dir = process.env.SESSION_HOME + "/" + code;
    while (fs.existsSync(output_dir)) {
      code = randomize('Aa0', 16);
      output_dir = process.env.SESSION_HOME + "/" + code;
    }
    //create output dir
    fs.mkdirSync(output_dir);
    //call py script
    let params = conf.params;
    params.output_dir = output_dir;
    const log = output_dir + "/log.txt";
    let data = JSON.stringify(params);
    fs.writeFileSync(output_dir + '/input.json', data);
    const cmd = "sleep 3";
    logger.info(cmd);

    //run local
    exec(cmd, (error, stdout, stderr) => {
      let status = 'complete';
      if (error) {
        status = 'failed';
        logger.error(error.message);
      }
      if (stderr) {
        status = 'failed';
        logger.error(stderr);
      }

      if (status === 'complete') {
        return res.json({
          success: true,
          code: code,
          url: 'https://kitware.github.io/trame/examples/paraview/cone.html'
        });
      } else {
        setTimeout(function () {
          return res.status(400).json({ success: false, errMessage: 'Failed to create trame instance.' });
        }, 3000);
      }
    });
  } catch (err) {
    logger.error(`/api/public/trame failed: ${err}`);
    return res.status(500).json({
      message: sysError,
      success: false,
    });
  }
}

module.exports = {
  trame,
};
