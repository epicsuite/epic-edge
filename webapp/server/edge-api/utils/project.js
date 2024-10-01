const fs = require('fs');
const Project = require('../models/project');
const { getAllFiles } = require('../../utils/common');
const { generateWorkflowResult, generateRunStats } = require('../../utils/cromwellWorkflow');
const config = require('../../config');

const getProject = (code, type, user) => new Promise((resolve, reject) => {
  // Use $eq to prevent query selector injections
  Project.findOne({
    'status': { $ne: 'delete' }, 'code': { $eq: code }
  }).then((project) => {
    if (project === null) {
      resolve(null);
    }
    if (type === 'admin') {
      resolve(project);
    }
    if (type === 'user' && (project.owner === user.email || project.sharedTo.includes(user.email) || project.public)) {
      resolve(project);
    } else if (type === 'public' && project.public) {
      resolve(project);
    } else if (project.parent) {
      let query = { status: { $ne: 'delete' }, code: project.parent, public: true };
      if (type === 'user') {
        query = { status: { $ne: 'delete' }, code: project.parent, $or: [{ owner: user.email }, { sharedTo: user.email }, { public: true }] };
      }
      Project.findOne(query).then((pp) => {
        if (pp) {
          resolve(project);
        } else {
          resolve(null);
        }
      }).catch((err) => { reject(err); });
    } else {
      resolve(null);
    }
  }).catch((err) => { reject(err); });
});

const updateProject = (query, req) => new Promise((resolve, reject) => {
  Project.findOne(query).then((oldProject) => {
    const proj = oldProject;
    if (!proj) {
      resolve(null);
    } else {
      if (req.body.name) {
        proj.name = req.body.name;
      }
      if (req.body.desc) {
        proj.desc = req.body.desc;
      }
      if (req.body.status) {
        proj.status = req.body.status;
      }
      if ('public' in req.body) {
        proj.public = req.body.public;
      }
      if (req.body.sharedTo) {
        proj.sharedTo = req.body.sharedTo;
      }
      if (req.body.jobPriority) {
        proj.jobPriority = req.body.jobPriority;
      }

      proj.updated = Date.now();
      proj.save().then((newProject) => {
        const project = newProject;
        // set children to 'delete'
        if (project.type.match(/batch/) && project.status === 'delete') {
          Project.find({
            status: { $ne: 'delete' }, code: { $in: project.children },
          }).then((projects) => {
            projects.forEach((subproject) => {
              const subproj = subproject;
              subproj.status = 'delete';
              subproj.updated = Date.now();
              subproj.save();
            });
          });
        }
        resolve(project);
      }).catch((err) => { reject(err); });
    }
  }).catch((err) => { reject(err); });
});

// Return conf.json as JSON object
const getProjectConf = (code, type, req) => new Promise((resolve, reject) => {
  getProject(code, type, req.user).then((proj) => {
    let confJson = {};
    if (proj) {
      const projHome = `${config.IO.PROJECT_BASE_DIR}/${code}`;
      confJson = JSON.parse(fs.readFileSync(`${projHome}/conf.json`));
    }

    resolve(confJson);
  }).catch((err) => { reject(err); });
});

const getProjectOutputs = (code, type, req) => new Promise((resolve, reject) => {
  const projDir = config.IO.PROJECT_BASE_DIR;
  getProject(code, type, req.user).then((proj) => {
    let files = [];
    if (proj && fs.existsSync(`${projDir}/${proj.code}/output`)) {
      files = getAllFiles(`${projDir}/${proj.code}/output`, files, req.body.fileTypes, '', `/projects/${proj.code}/output`, `${projDir}/${proj.code}/output`);
    }
    resolve(files);
  }).catch((err) => { reject(err); });
});

const getProjectBatchOutputs = (code, type, req) => new Promise((resolve, reject) => {
  const projDir = config.IO.PROJECT_BASE_DIR;
  getProject(code, type, req.user).then(project => {
    if (!project.type.includes('batch')) {
      reject(new Error('Not a batch project'));
    }
    Project.find({
      'status': { $ne: 'delete' }, 'code': { $in: project.children }
    }).then((projects) => {
      const allfiles = [];
      if (projects.length === 0) {
        resolve(allfiles);
      } else {
        projects.forEach((proj, index) => {
          const files = [];
          if (proj && fs.existsSync(`${projDir}/${proj.code}/output`)) {
            allfiles.push(...getAllFiles(`${projDir}/${proj.code}/output`, files, req.body.fileTypes, proj.name, `/projects/${proj.code}/output`, `${projDir}/${proj.code}/output`));
          }
          if (index === projects.length - 1) {
            resolve(allfiles);
          }
        });
      }
    });
  }).catch(err => { reject(err); });
});

const getProjectResult = (code, type, req) => new Promise((resolve, reject) => {
  getProject(code, type, req.user).then((proj) => {
    let result = {};
    if (proj) {
      const projHome = `${config.IO.PROJECT_BASE_DIR}/${code}`;
      const resultJson = `${projHome}/result.json`;

      if (!fs.existsSync(resultJson)) {
        generateWorkflowResult(proj);
      }
      result = JSON.parse(fs.readFileSync(resultJson));

    }
    resolve(result);
  }).catch((err) => { reject(err); });
});

const getProjectRunStats = (code, type, req) => new Promise((resolve, reject) => {
  getProject(code, type, req.user).then((proj) => {
    let stats = {};
    if (proj) {
      const projHome = `${config.IO.PROJECT_BASE_DIR}/${code}`;
      const statsJson = `${projHome}/run_stats.json`;
      generateRunStats(proj);
      stats = JSON.parse(fs.readFileSync(statsJson));

    }
    resolve(stats);
  }).catch((err) => { reject(err); });
});

module.exports = {
  getAllFiles,
  getProject,
  updateProject,
  getProjectConf,
  getProjectOutputs,
  getProjectBatchOutputs,
  getProjectResult,
  getProjectRunStats,
};
