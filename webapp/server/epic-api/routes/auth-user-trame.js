const router = require('express').Router();
const {
  trame,
} = require('../controllers/auth-user-trame-controller');
/**
 * /api/auth-user/trame
 *   post
 * */
router.post('/trame', async (req, res) => {
  await trame(req, res);
});

module.exports = router;
