const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const Email = require('email-templates');

const config = {};
let transporter = null;
if (process.env.SENDMAIL_PROXY) {
  config.proxy = process.env.SENDMAIL_PROXY;
}
config.auth = {
  api_key: process.env.SENDMAIL_PASS,
  domain: process.env.SENDMAIL_USER,
};
transporter = nodemailer.createTransport(mg(config));

const email = new Email({
  views: {
    root: 'email_templates',
    options: { extension: 'ejs' },
  },
  message: {
    from: process.env.SENDMAIL_FROM,
  },
  send: true,
  transport: transporter,
});

// Variables in templates
const vars = {
  'getActivationLink': {
    subject: process.env.ACTIVATE_USER_SUBJECT,
    actionName: process.env.ACTIVATE_USER_ACTION,
    actionMessage: process.env.ACTIVATE_USER_ACTION_MESSAGE,
  },
  'getResetPasswordLink': {
    subject: process.env.RESETPASSWORD_SUBJECT,
    actionName: process.env.RESETPASSWORD_ACTION,
    actionMessage: process.env.RESETPASSWORD_ACTION_MESSAGE,
  },
  'projectStatusNotification': {
    subject: process.env.PROJECT_STATUS_SUBJECT,
  }
};

module.exports = {
  email,
  vars,
};
