const config = require('../../config');
// note: the first status will be the default in the DB.
const structureStatus = ['live', 'delete'];
// list of trame commands
const trameCmds = {
  'structure':
    `${config.EPIC.PYTHON} ${config.EPIC.TRAME_APP_BASE_DIR}/epic.viewer.py \
<%= data %> <%= track %> --server --port <%= port %> &`,
  'compare':
    `cd <%= trameHome %>; \
${config.EPIC.PVPYTHON} \
--venv ${config.EPIC.COMPARE_ENV_PYTHONPATH} \
--force-offscreen-rendering \
${config.EPIC.COMPARE_APP} \
--port <%= port %> \
--session <%= sessionYaml %> \
--plugindir ${config.EPIC.PVPYTHON_PLUGIN_DIR} \
--serve &`,
};

module.exports = {
  structureStatus,
  trameCmds,
};
