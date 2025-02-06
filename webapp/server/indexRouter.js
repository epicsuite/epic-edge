const router = require('express').Router();
const passport = require('passport');
const userRoutes = require('./edge-api/routes/user');
const projectRoutes = require('./edge-api/routes/project');
const dataRoutes = require('./edge-api/routes/data');
const authUserRoutes = require('./edge-api/routes/auth-user');
const authUserProjectRoutes = require('./edge-api/routes/auth-user-project');
const authUserUploadRoutes = require('./edge-api/routes/auth-user-upload');
const authUserDataRoutes = require('./edge-api/routes/auth-user-data');
const adminUserRoutes = require('./edge-api/routes/admin-user');
const adminProjectRoutes = require('./edge-api/routes/admin-project');
const adminUploadRoutes = require('./edge-api/routes/admin-upload');
const trameRoutes = require('./epic-api/routes/trame');
const authUserTrameRoutes = require('./epic-api/routes/auth-user-trame');
const structureRoutes = require('./epic-api/routes/structure');
const authUserStructureRoutes = require('./epic-api/routes/auth-user-structure');
const adminStructureRoutes = require('./epic-api/routes/admin-structure');

/* GET home page. */
router.get('/', (req, res) => {
  res.send('The API server is on!');
});

router.use('/user', userRoutes);
router.use('/public/projects', projectRoutes);
router.use('/public/data', dataRoutes);
router.use('/auth-user', passport.authenticate('user', { session: false }), authUserRoutes);
router.use('/auth-user', passport.authenticate('user', { session: false }), authUserProjectRoutes);
router.use('/auth-user', passport.authenticate('user', { session: false }), authUserUploadRoutes);
router.use('/auth-user', passport.authenticate('user', { session: false }), authUserDataRoutes);
router.use('/admin', passport.authenticate('admin', { session: false }), adminUserRoutes);
router.use('/admin', passport.authenticate('admin', { session: false }), adminProjectRoutes);
router.use('/admin', passport.authenticate('admin', { session: false }), adminUploadRoutes);
router.use('/public/structures', structureRoutes);
router.use('/auth-user', passport.authenticate('user', { session: false }), authUserStructureRoutes);
router.use('/public', trameRoutes);
router.use('/auth-user', passport.authenticate('user', { session: false }), authUserTrameRoutes);
router.use('/admin', passport.authenticate('admin', { session: false }), adminStructureRoutes);

module.exports = router;
