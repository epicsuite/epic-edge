/**
 * Configure the app based upon environment variables.
 *
 * This module acts as an interface between the process environment variables (i.e. `process.env.*`)
 * and the modules that consume their values. This (a) facilitates the population of variables whose
 * values depend upon file paths or other variables; (b) facilitates validation of their values and
 * the assignment of default/fallback values; and (c) reduces the number of occurrences of `process.env.*`
 * variables throughout the codebase, which can be sources of errors as some IDEs do not validate their
 * existence during development, since, at that time, they do not exist as JavaScript symbols.
 *
 * References:
 * - https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs
 * - https://developer.mozilla.org/en-US/docs/Glossary/Falsy
 */

const path = require('path');

/**
 * Returns `true` if the value matches "true" (ignoring letter casing); otherwise, returns `false`.
 *
 * Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test
 *
 * Examples:
 * - f("TrUe")    => true
 * - f("fAlSe")   => false
 * - f(undefined) => false
 *
 * @param val {string|undefined} The value you want to resolve to a Boolean value
 * @return {boolean} The Boolean value
 */
const makeBoolean = (val) => typeof val === 'string' ? (/^true$/i).test(val) : false;

/**
 * Returns the value resolved to an integer; or `undefined` if the original value is `undefined`.
 *
 * References: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt
 *
 * Examples:
 * f("123")     => 123
 * f("xyz")     => NaN (which is a Falsy value)
 * f(undefined) => undefined
 *
 * @param val {string|undefined} The value you want to resolve to an integer
 * @return {number|undefined} The integer, or `undefined`
 */
const makeIntIfDefined = (val) => typeof val === 'string' ? parseInt(val, 10) : undefined;

// Determine several reusable directory paths based upon environment variables
// and/or the path to the directory containing this `config.js` file.
const appServerDir = process.env.APP_SERVER_DIR ? process.env.APP_SERVER_DIR : __dirname;
const CLIENT_BASE_DIR = path.join(appServerDir, '../client');
const NEXTFLOW_BASE_DIR = path.join(appServerDir, '../../workflows/Nextflow');
const CROMWELL_BASE_DIR = path.join(appServerDir, '../../workflows/Cromwell');
const IO_BASE_DIR = process.env.IO_BASE_DIR || path.join(appServerDir, '../../io');

const config = {
  // Name of environment in which application is running (either "production" or "development").
  // Reference: https://expressjs.com/en/advanced/best-practice-performance.html#set-node_env-to-production
  NODE_ENV: process.env.NODE_ENV || 'production',
  APP: {
    // Base URL at which visitors can access the web server (e.g. "https://epic.lanl.gov").
    // Note: Some emails the server sends to visitors will contain URLs based upon this one.
    UI_BASE_URL: process.env.APP_UI_BASE_URL || 'https://epic.lanl.gov',
    // Port number on which the web server will listen for HTTP requests.
    SERVER_PORT: makeIntIfDefined(process.env.APP_SERVER_PORT) || 5000,
    // Version identifier of the application.
    VERSION: process.env.EDGE_WEB_APP_VERSION || 'v3.0.0-default',
    API_ERROR: process.env.API_ERROR || 'system error',
    SYSTEM_MESSAGE: process.env.SYSTEM_MESSAGE || null,
  },
  AUTH: {
    // A secret string with which the web server will sign JWTs (JSON Web Tokens).
    // Note: You can generate one via: $ node -e 'console.log(require("crypto").randomBytes(20).toString("hex"))'
    JWT_SECRET: process.env.JWT_SECRET,
  },
  CLIENT: {
    // Path to the client's "build" directory on the filesystem.
    BUILD_DIR: process.env.CLIENT_BASE_DIR || path.join(CLIENT_BASE_DIR, 'build'),
  },
  SLURM: {
    // Max allowed number of jobs in slurm.
    NUM_JOBS_MAX: makeIntIfDefined(process.env.SLURM_NUM_JOBS_MAX) || 100000,
    // Total size of the input files allowed per job.
    // Note: 161061273600 Bytes is 150 Gibibytes (161 Gigabytes).
    JOBS_INPUT_MAX_SIZE_BYTES: makeIntIfDefined(process.env.SLURM_JOBS_INPUT_MAX_SIZE_BYTES) || 161061273600,
  },
  NEXTFLOW: {
    CONDA_ACTIVATE: process.env.NEXTFLOW_CONDA_ACTIVATE || null,
    PROFILE: process.env.NEXTFLOW_PROFILE || null,
    EDGE_ROOT: process.env.NEXTFLOW_EDGE_ROOT || null,
    SLURM_EDGE_ROOT: process.env.NEXTFLOW_SLURM_EDGE_ROOT || null,
    SLURM_SSH: process.env.NEXTFLOW_SLURM_SSH || '',
    EXECUTOR: process.env.NEXTFLOW_EXECUTOR || 'local',
    // Max allowed number of jobs in nextflow.
    NUM_JOBS_MAX: makeIntIfDefined(process.env.NEXTFLOW_NUM_JOBS_MAX) || 100000,
    // Total size of the input files allowed per job.
    // Note: 161061273600 Bytes is 150 Gibibytes (161 Gigabytes).
    JOBS_INPUT_MAX_SIZE_BYTES: makeIntIfDefined(process.env.NEXTFLOW_JOBS_INPUT_MAX_SIZE_BYTES) || 161061273600,
    // Directory of the workflow files.
    WORKFLOW_DIR: process.env.NEXTFLOW_WORKFLOW_DIR || NEXTFLOW_BASE_DIR,
    // Directory of the workflow templates. The Workflow templates are used for creating nextflow workflow inputs.
    TEMPLATE_DIR: process.env.NEXTFLOW_TEMPLATE_DIR || path.join(NEXTFLOW_BASE_DIR, 'templates'),
    // Directory of the workflow configs. The Workflow configs are used for running nextflow workflows.
    CONFIG_DIR: process.env.NEXTFLOW_CONF_DIR || path.join(NEXTFLOW_BASE_DIR, 'configs'),
  },
  CROMWELL: {
    // Base URL at which HTTP clients can access the Cromwell API.
    API_BASE_URL: process.env.CROMWELL_API_BASE_URL || 'http://localhost:8000/api/workflows/v1',
    // Max allowed number of jobs in cromwell.
    NUM_JOBS_MAX: makeIntIfDefined(process.env.CROMWELL_NUM_JOBS_MAX) || 100000,
    // Total size of the input files allowed per job.
    // Note: 161061273600 Bytes is 150 Gibibytes (161 Gigabytes).
    JOBS_INPUT_MAX_SIZE_BYTES: makeIntIfDefined(process.env.CROMWELL_JOBS_INPUT_MAX_SIZE_BYTES) || 161061273600,
    // The type of workflow language and must be "WDL" currently.
    WORKFLOW_TYPE: process.env.CROMWELL_WORKFLOW_TYPE || 'WDL',
    // The version of the workflow language. Valid versions: 'draft-2', '1.0'.
    WORKFLOW_TYPE_VERSION: process.env.CROMWELL_WORKFLOW_TYPE_VERSION || 'draft-2',
    // Directory of the workflow WDL files.
    WDL_DIR: process.env.CROMWELL_WDL_DIR || path.join(CROMWELL_BASE_DIR, 'WDL'),
    // Directory of the workflow templates. The Workflow templates are used for creating cromwell inputs.
    TEMPLATE_DIR: process.env.CROMWELL_TEMPLATE_DIR || path.join(CROMWELL_BASE_DIR, 'templates'),
    CONF: process.env.CROMWELL_CONF || path.join(CROMWELL_BASE_DIR, 'conf.json'),
  },
  LOCAL: {
    NUM_JOBS_MAX: makeIntIfDefined(process.env.LOCAL_NUM_JOBS_MAX) || 2,
  },
  CRON: {
    // Port number on which the cron web server will listen for HTTP requests.
    SERVER_PORT: makeIntIfDefined(process.env.CRON_SERVER_PORT) || 5555,
    // Number of days for which the system will preserve a project after a user opts to delete it.
    PROJECT_DELETION_GRACE_PERIOD_DAYS: makeIntIfDefined(process.env.PROJECT_DELETION_GRACE_PERIOD_DAYS) || 7,
    // Cron job schedules:
    // Reference: https://crontab.guru/ (cron schedule decoder)
    SCHEDULES: {
      // monitor workflow requests on every 2 minutes
      LOCAL_WORKFLOW_MONITOR: process.env.CRON_LOCAL_WORKFLOW_MONITOR_SCHEDULE || '0-59/2 * * * *',
      // monitor local jobs on every 2 minutes
      LOCAL_JOB_MONITOR: process.env.CRON_LOCALJOB_MONITOR_SCHEDULE || '0-59/2 * * * *',
      // monitor workflow requests on every 2 minutes
      CROMWELL_WORKFLOW_MONITOR: process.env.CRON_CROMWELL_WORKFLOW_MONITOR_SCHEDULE || '0-59/2 * * * *',
      // monitor cromwell jobs on every 2 minutes
      CROMWELL_JOB_MONITOR: process.env.CRON_CROMWELL_JOB_MONITOR_SCHEDULE || '1-59/2 * * * *',
      // monitor nextflow jobs on every 2 minutes
      NEXTFLOW_WORKFLOW_MONITOR: process.env.CRON_NEXTFLOW_WORKFLOW_MONITOR_SCHEDULE || '0-59/2 * * * *',
      // monitor nextflow jobs on every 2 minutes
      NEXTFLOW_JOB_MONITOR: process.env.CRON_NEXTFLOW_JOB_MONITOR_SCHEDULE || '1-59/2 * * * *',
      // monitor file upload deletion/expiration every day at midnight
      FILE_UPLOAD_MONITOR: process.env.CRON_FILE_UPLOAD_MONITOR_SCHEDULE || '0 0 * * *',
      // monitor project status on every 1 minute
      PROJECT_STATUS_MONITOR: process.env.CRON_PROJECT_STATUS_MONITOR_SCHEDULE || '*/1 * * * *',
      // monitor project deletion every day at 10pm
      PROJECT_DELETION_MONITOR: process.env.CRON_PROJECT_DELETION_MONITOR_SCHEDULE || '0 22 * * *',
      // backup nmdcedge database every day at 1 am
      DATABASE_BACKUP_CREATOR: process.env.CRON_DATABASE_BACKUP_CREATOR_SCHEDULE || '0 1 * * *',
      // delete old db backups every day at 2 am
      DATABASE_BACKUP_PRUNER: process.env.CRON_DATABASE_BACKUP_PRUNER_SCHEDULE || '0 2 * * *',
      // monitor nextflow jobs on every 3 minutes
      SLURM_WORKFLOW_MONITOR: process.env.CRON_SLURM_WORKFLOW_MONITOR_SCHEDULE || '0-59/3 * * * *',
      // monitor nextflow jobs on every 3 minutes
      SLURM_JOB_MONITOR: process.env.CRON_SLURM_JOB_MONITOR_SCHEDULE || '1-59/3 * * * *',
      // monitor trame instance deletion/expiration every day at 4am
      TRAME_MONITOR: process.env.CRON_TRAME_MONITOR_SCHEDULE || '0 4 * * *',
      // monitor public trame on every 3 minutes
      TRAME_PUBLIC_MONITOR: process.env.CRON_SLURM_JOB_MONITOR_SCHEDULE || '2-59/3 * * * *',
    },
  },
  DATABASE: {
    // Host at which web server can access MongoDB server.
    SERVER_HOST: process.env.DATABASE_HOST || 'localhost',
    // Port at which web server can access MongoDB server (on the specified host).
    SERVER_PORT: makeIntIfDefined(process.env.DATABASE_PORT) || 27017,
    // Credentials with which the web server can authenticate with the MongoDB server.
    USERNAME: process.env.DATABASE_USERNAME,
    PASSWORD: process.env.DATABASE_PASSWORD,
    // Name of MongoDB database.
    // TODO: Update environment variable name to `DATABASE_NAME` to be more similar to other environment variables.
    //       Note: That will require coordination with the people that manage the various deployments of this app.
    NAME: process.env.DB_NAME || 'epicedge',
    // Path to directory in which the system will store the database backups it creates.
    BACKUP_DIR: process.env.DATABASE_BACKUP_DIR || path.join(IO_BASE_DIR, 'db'),
    // Duration for which database backups will be preserved after their creation (note: 604800 seconds is 1 week).
    BACKUP_LIFETIME_SECONDS: makeIntIfDefined(process.env.DATABASE_BACKUP_LIFETIME_SECONDS) || 604800,
  },
  // Parameters related to sending email.
  // Reference: https://nodemailer.com/smtp/proxies/
  EMAIL: {
    FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS || 'no-reply@epic-edge.org',
    SERVICE_PROXY_URL: process.env.EMAIL_SERVICE_PROXY_URL,
    MAILGUN_DOMAIN: process.env.EMAIL_MAILGUN_DOMAIN,
    MAILGUN_API_KEY: process.env.EMAIL_MAILGUN_API_KEY,
    // activate user
    ACTIVATE_USER_SUBJECT: process.env.ACTIVATE_USER_SUBJECT || 'Your EPIC EDGE login account',
    ACTIVATE_USER_ACTION: process.env.ACTIVATE_USER_ACTION || 'Activate Your Account',
    ACTIVATE_USER_ACTION_MESSAGE: process.env.ACTIVATE_USER_ACTION_MESSAGE || 'Please activate your account.',
    // resetpassword
    RESETPASSWORD_SUBJECT: process.env.RESETPASSWORD_SUBJECT || 'Reset your EPIC EDGE login password',
    RESETPASSWORD_ACTION: process.env.RESETPASSWORD_ACTION || 'Reset Your Password',
    RESETPASSWORD_ACTION_MESSAGE: process.env.RESETPASSWORD_ACTION_MESSAGE || 'Someone requested a password reset for your account. If this was not you, please disregard this email. If you would like to continue, click the button to reset your password.',
    // project status
    SEND_PROJECT_STATUS_EMAILS: makeBoolean(process.env.SEND_PROJECT_STATUS_EMAILS) || false,
    PROJECT_STATUS_SUBJECT: process.env.PROJECT_STATUS_SUBJECT || 'Your EPIC EDGE project status'
  },
  FILE_UPLOADS: {
    // Note: 10737418200 Bytes is 10 Gibibytes (10.7 Gigabytes).
    // Reference: https://www.xconvert.com/unit-converter/bytes-to-gigabytes
    MAX_FILE_SIZE_BYTES: makeIntIfDefined(process.env.FILE_UPLOADS_MAX_FILE_SIZE_BYTES) || 10737418200,
    // Note: 161061273600 Bytes is 150 Gibibytes (161 Gigabytes).
    MAX_STORAGE_SIZE_BYTES: makeIntIfDefined(process.env.FILE_UPLOADS_MAX_STORAGE_SIZE_BYTES) || 161061273600,
    FILE_LIFETIME_DAYS: makeIntIfDefined(process.env.FILE_UPLOADS_FILE_LIFETIME_DAYS) || 180,
    DELETION_GRACE_PERIOD_DAYS: makeIntIfDefined(process.env.FILE_UPLOADS_DELETION_GRACE_PERIOD_DAYS) || 5,
    ALLOWED_EXTENSIONS: process.env.FILEUPLOAD_ALLOWED_EXTENSIONS || '',
  },
  IO: {
    // Directory to store workflow results.
    PROJECT_BASE_DIR: process.env.PROJECTS_BASE_DIR || path.join(IO_BASE_DIR, 'projects'),
    // Directory to store sra workflow results.
    SRA_BASE_DIR: process.env.SRA_BASE_DIR || path.join(IO_BASE_DIR, 'sra'),
    // Directory to store public data.
    PUBLIC_BASE_DIR: process.env.PUBLIC_BASE_DIR || path.join(IO_BASE_DIR, 'public'),
    // Directory to store user uploaded files
    UPLOADED_FILES_DIR: process.env.UPLOADED_FILES_DIR || path.join(IO_BASE_DIR, 'upload/files'),
    // Directory used by file uploading function.
    UPLOADED_FILES_TEMP_DIR: process.env.UPLOADED_FILES_TEMP_DIR || path.join(IO_BASE_DIR, 'upload/tmp'),
    // Globus
    GLOBUG_DATA_HOME_DIR: process.env.GLOBUS_DATA_HOME_DIR,
  },
  // Parameters that influence the behavior of `Winston.js`, a logging library.
  // Reference: https://github.com/winstonjs/winston-daily-rotate-file#options
  LOGGING: {
    LOG_DIR: process.env.LOG_DIR || path.join(IO_BASE_DIR, 'log'),
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    LOG_FILE_NAME_TEMPLATE: process.env.LOG_FILE_NAME_TEMPLATE || 'EDGE-workflows-%DATE%.log',
    LOG_DATE_TEMPLATE: process.env.LOG_DATE_TEMPLATE || 'YYYY-MM-DD',
    LOG_FILE_MAX_SIZE: process.env.LOG_FILE_MAX_SIZE || '20m',
    LOG_FILE_MAX_QUANTITY: process.env.LOG_FILE_MAX_QUANTITY || '14d',
  },
  EPIC: {
    // Directory to store slurpy result datasets
    PRODUCT_BASE_DIR: process.env.EPIC_PRODUCT_BASE_DIR || path.join(IO_BASE_DIR, 'products'),
    // Directory to store structure datasets
    STRUCTURE_BASE_DIR: process.env.EPIC_STRUCTURE_BASE_DIR || path.join(IO_BASE_DIR, 'structures'),
    // Directory to store trame view temp files
    TRAME_BASE_DIR: process.env.EPIC_STRUCTURE_BASE_DIR || path.join(IO_BASE_DIR, 'trame'),
    // Directory to store trame applications
    TRAME_APP_BASE_DIR: process.env.EPIC_TRAME_APP_BASE_DIR || path.join(__dirname, '../../trame/apps'),
    TRAME_BASE_URL: process.env.EPIC_TRAME_BASE_URL || 'http://localhost:',
    TRAME_PUBLIC_PORT_START: makeIntIfDefined(process.env.EPIC_TRAME_PUBLIC_PORT_START) || 8001,
    TRAME_PUBLIC_PORT_END: makeIntIfDefined(process.env.EPIC_TRAME_PUBLIC_PORT_END) || 8010,
    TRAME_USER_PORT_START: makeIntIfDefined(process.env.EPIC_TRAME_USER_PORT_START) || 8011,
    TRAME_USER_PORT_END: makeIntIfDefined(process.env.EPIC_TRAME_USER_PORT_END) || 8020,
    // in hours, trame http instance will be deleted after the grace period
    TRAME_DELETE_GRACE_PERIOD_HOURS: makeIntIfDefined(process.env.EPIC_TRAME_DELETE_GRACE_PERIOD_HOURS) || 12,
    // in hours, trame http instance will be deleted after the grace period
    TRAME_PUBLIC_DELETE_GRACE_PERIOD_HOURS: makeIntIfDefined(process.env.EPIC_PUBLIC_TRAME_DELETE_GRACE_PERIOD_HOURS) || 1,
    // python path
    PYTHON: process.env.PYTHON || 'python3',
    // pvpython
    PVPYTHON: process.env.PVPYTHON || 'PVPYTHON-not-found-in-env',
    PVPYTHON_PLUGIN_DIR: process.env.PVPYTHON_PLUGIN_DIR || 'PVPYTHON_PLUGIN_DIR-not-found-in-env',
    COMPARE_APP: process.env.COMPARE_APP || 'COMPARE_APP-not-found-in-env',
    COMPARE_TMPL: process.env.COMPARE_TMPL || 'COMPARE_TMPL-not-found-in-env',
    COMPARE_SETTINGS: process.env.COMPARE_SETTINGS || 'COMPARE_SETTINGS-not-found-in-env',
    COMPARE_ENV_PYTHONPATH: process.env.COMPARE_ENV_PYTHONPATH || 'COMPARE_ENV_PYTHONPATH-not-found-in-env',
  }
};

module.exports = config;
