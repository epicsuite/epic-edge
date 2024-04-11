const router = require('express').Router();
const passport = require('passport');
const userRoutes = require('./edge-api/routes/user');
const projectRoutes = require('./edge-api/routes/project');
const authUserRoutes = require('./edge-api/routes/auth-user');
const authUserProjectRoutes = require('./edge-api/routes/auth-user-project');
const authUserUploadRoutes = require('./edge-api/routes/auth-user-upload');
const authUserDataRoutes = require('./edge-api/routes/auth-user-data');
const adminUserRoutes = require('./edge-api/routes/admin-user');
const adminProjectRoutes = require('./edge-api/routes/admin-project');
const adminUploadRoutes = require('./edge-api/routes/admin-upload');
const datasetRoutes = require('./epic-api/routes/dataset');
const authUserDatasetRoutes = require('./epic-api/routes/auth-user-dataset');
const sessionRoutes = require('./epic-api/routes/session');
// const authUserSessionRoutes = require('./epic-api/routes/auth-user-session');
const adminDatasetRoutes = require('./epic-api/routes/admin-dataset');
// const adminSessionRoutes = require('./epic-api/routes/admin-session');
const structureRoutes = require('./epic-api/routes/structure');
const authUserStructureRoutes = require('./epic-api/routes/auth-user-structure');
const adminStructureRoutes = require('./epic-api/routes/admin-structure');

/* GET home page. */
router.get('/', (req, res) => {
  res.send('The API server is on!');
});

router.use('/user', userRoutes);
router.use('/public/projects', projectRoutes);
router.use('/auth-user', passport.authenticate('user', { session: false }), authUserRoutes);
router.use('/auth-user', passport.authenticate('user', { session: false }), authUserProjectRoutes);
router.use('/auth-user', passport.authenticate('user', { session: false }), authUserUploadRoutes);
router.use('/auth-user', passport.authenticate('user', { session: false }), authUserDataRoutes);
router.use('/admin', passport.authenticate('admin', { session: false }), adminUserRoutes);
router.use('/admin', passport.authenticate('admin', { session: false }), adminProjectRoutes);
router.use('/admin', passport.authenticate('admin', { session: false }), adminUploadRoutes);
router.use('/public/datasets', datasetRoutes);
router.use('/public/structures', structureRoutes);
router.use('/auth-user', passport.authenticate('user', { session: false }), authUserDatasetRoutes);
router.use('/auth-user', passport.authenticate('user', { session: false }), authUserStructureRoutes);
router.use('/public/sessions', sessionRoutes);
// router.use('/auth-user', passport.authenticate('user', { session: false }), authUserSessionRoutes);
router.use('/admin', passport.authenticate('admin', { session: false }), adminDatasetRoutes);
router.use('/admin', passport.authenticate('admin', { session: false }), adminStructureRoutes);
// router.use('/admin', passport.authenticate('admin', { session: false }), adminSessionRoutes);

module.exports = router;
