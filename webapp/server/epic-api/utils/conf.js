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
  'episcope':
    // eslint-disable-next-line no-multi-str
    'cd /panfs/biopan04/epicdev/apps/episcope; \
/panfs/biopan04/epicdev/apps/ParaView-osmesa/bin/pvpython \
--venv .venv -m episcope.app \
--data <%= data %> \
--port <%= port %> \
--serve &',
};

module.exports = {
  structureStatus,
  trameCmds,
};
