const router = require('express').Router();
const { validationRules: datasetValidationRules, validate: datasetValidate } = require('../validations/code-validator');
const {
  getAll,
  getOne,
} = require('../controllers/dataset-controller');

/**
 * @swagger
 * /api/public/datasets:
 *   get:
 *     summary: All public datasets
 *     tags: [Dataset]
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
router.get('/', async (req, res) => {
  await getAll(req, res);
});

/**
 * @swagger
 * /api/public/datasets/{code}:
 *   get:
 *     summary: Get a dataset by unique code
 *     tags: [Dataset]
 *     parameters:
 *      - in: path
 *        name: code
 *        required: true
 *        type: string
 *        value: 'enter valid code'
 *        description: The dataset unique code.
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
router.get('/:code', datasetValidationRules(), datasetValidate, async (req, res) => {
  await getOne(req, res);
});

module.exports = router;
