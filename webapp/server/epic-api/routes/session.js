const router = require('express').Router();
const {
  trame,
} = require('../controllers/session-controller');
/**
 * /api/public/sessions/trame
 *   post
 * */
router.post('/trame', async (req, res) => {
  await trame(req, res);
});

module.exports = router;
