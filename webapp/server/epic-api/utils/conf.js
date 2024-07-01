// note: the first status will be the default in the DB.
const datasetStatus = ['live', 'delete'];
const sessionStatus = ['live', 'delete'];
const structureStatus = ['live', 'delete'];
// list of trame apps
const trameApps = { default: 'epic.viewer.py' };

module.exports = {
  datasetStatus,
  sessionStatus,
  structureStatus,
  trameApps,
};
