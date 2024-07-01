const router = require('express').Router();
const passport = require('passport');
const userRoutes = require('../../edge-api/routes/user');
const authUserRoutes = require('../../edge-api/routes/auth-user');
const adminUserRoutes = require('../../edge-api/routes/admin-user');
const datasetRoutes = require('./dataset');
const authUserDatasetRoutes = require('./auth-user-dataset');
const structureRoutes = require('./structure');
const authUserStructureRoutes = require('./auth-user-structure');
// const sessionRoutes = require('./session');
// const authUserSessionRoutes = require('./auth-user-session');
const adminDatasetRoutes = require('./admin-dataset');
// const adminSessionRoutes = require('./admin-session');
const adminStructureRoutes = require('./admin-structure');

/* GET home page. */
router.get('/', (req, res) => {
  res.send('The API server is on!');
});

router.use('/user', userRoutes);
router.use('/auth-user', passport.authenticate('user', { session: false }), authUserRoutes);
router.use('/admin', passport.authenticate('admin', { session: false }), adminUserRoutes);
router.use('/public/datasets', datasetRoutes);
router.use('/public/structures', structureRoutes);
router.use('/auth-user', passport.authenticate('user', { session: false }), authUserDatasetRoutes);
router.use('/auth-user', passport.authenticate('user', { session: false }), authUserStructureRoutes);
// router.use('/public/sessions', sessionRoutes);
// router.use('/auth-user', passport.authenticate('user', { session: false }), authUserSessionRoutes);
router.use('/admin', passport.authenticate('admin', { session: false }), adminDatasetRoutes);
router.use('/admin', passport.authenticate('admin', { session: false }), adminStructureRoutes);
// router.use('/admin', passport.authenticate('admin', { session: false }), adminSessionRoutes);

module.exports = router;
