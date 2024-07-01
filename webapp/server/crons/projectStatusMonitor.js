const Project = require('../edge-api/models/project');
const User = require('../edge-api/models/user');
const logger = require('../utils/logger');
const { projectStatusSender } = require('../mailers/senders');

module.exports = function projectMonitor() {
  logger.debug('project status monitor');

  // notify complete/failed projects
  Project.find({ 'notified': false }).then(projs => {
    projs.forEach(proj => {
      if (process.env.SENDMAIL_PROJECT === 'on') {
        if (proj.status === 'complete' || proj.status === 'failed') {
          User.findOne({ email: proj.owner }).then(user => {
            if (!user) {
              logger.debug(`User not found: ${proj.owner}`);
            } else if (user.notification.isOn) {
              const data = {
                projectName: proj.name,
                projectDesc: proj.desc,
                projectCreated: proj.created,
                projectType: proj.label,
                projectStatus: proj.status,
                projectPageURL: `${process.env.PROJECT_URL}${proj.code}`
              };
              // logger.debug(`Notify user: ${user.notification.email}`);
              projectStatusSender(user.notification.email, data);
            }
          }).catch((err) => {
            logger.error(err);
          });
          proj.notified = true;
          proj.updated = Date.now();
          proj.save();
        }
      } else {
        proj.notified = true;
        proj.updated = Date.now();
        proj.save();
      }
    });
  });
};
