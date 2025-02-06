const router = require('express').Router();
const {
  getPublicFiles,
} = require('../controllers/data-controller');

/**
 * @swagger
 * /api/public/data:
 *   post:
 *     summary: List public data
 *     tags: [Data]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/models/publicData'
 *     responses:
 *       200:
 *         description: Action successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/models/actionSuccessful'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/models/actionFailed'
 *       500:
 *         description: API server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/models/serverError'
 */

router.post('/', async (req, res) => {
  await getPublicFiles(req, res);
});

module.exports = router;
