const router = require('express').Router();
const { validationRules: updateValidationRules, validate: updateValidate } = require('../validations/code-validator');
const {
  updateOne,
  getAll,
} = require('../controllers/admin-structure-controller');

/**
 * @swagger
 * /api/admin/structures:
 *   get:
 *     summary: List structures
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
router.get('/structures', async (req, res) => {
  await getAll(req, res);
});

/**
 * @swagger
 * /api/admin/structures/{code}:
 *   put:
 *     summary: Update structure
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: code
 *        required: true
 *        type: string
 *        value: test
 *        description: The structure unique code.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/models/updateStructure'
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
router.put('/structures/:code', updateValidationRules(), updateValidate, async (req, res) => {
  await updateOne(req, res);
});

module.exports = router;
