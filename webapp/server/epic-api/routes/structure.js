const router = require('express').Router();
const { validationRules: structureValidationRules, validate: structureValidate } = require('../validations/code-validator');
const {
  getAll,
  getOne,
} = require('../controllers/structure-controller');

/**
 * @swagger
 * /api/public/structures:
 *   get:
 *     summary: All public structures
 *     tags: [Structure]
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
 * /api/public/structures/{code}:
 *   get:
 *     summary: Get a structure by unique code
 *     tags: [Structure]
 *     parameters:
 *      - in: path
 *        name: code
 *        required: true
 *        type: string
 *        value: 'enter valid code'
 *        description: The structure unique code.
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
router.get('/:code', structureValidationRules(), structureValidate, async (req, res) => {
  await getOne(req, res);
});

module.exports = router;
