const router = require('express').Router();
const {
  trame,
} = require('../controllers/trame-controller');
/**
 * /api/public/trame
 *   post
 * */
router.post('/trame', async (req, res) => {
  await trame(req, res);
});

module.exports = router;
