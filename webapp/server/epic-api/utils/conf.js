const config = require('../../config');
// note: the first status will be the default in the DB.
const structureStatus = ['live', 'delete'];
// list of trame commands
const trameCmds = {
  'structure':
    `${config.EPIC.PYTHON} ${config.EPIC.TRAME_APP_BASE_DIR}/epic.viewer.py \
<%= data %> <%= track %> --server --port <%= port %> &`,
  'compare':
    `export PYTHONPATH=$PYTHONPATH:${config.EPIC.COMPARE_ENV_PYTHONPATH}; \
${config.EPIC.PVPYTHON} \
--force-offscreen-rendering \
${config.EPIC.COMPARE_APP} \
--port <%= port %> \
--leftfile <%= leftfile %> \
--rightfile <%= rightfile %> \
--plugindir ${config.EPIC.PVPYTHON_PLUGIN_DIR} \
--serve &`,
};

module.exports = {
  structureStatus,
  trameCmds,
};
