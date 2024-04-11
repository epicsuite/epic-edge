const router = require('express').Router();
const { validationRules: codeValidationRules, validate: codeValidate } = require('../validations/code-validator');
const { validationRules: addValidationRules, validate: addValidate } = require('../validations/structure-validator');
const {
  addOne,
  getOne,
  updateOne,
  getOwn,
  getAll,
} = require('../controllers/auth-user-structure-controller');

/**
 * @swagger
 * /api/auth-user/structures:
 *   get:
 *     summary: List structures owned by user
 *     tags: [AuthUser]
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
  await getOwn(req, res);
});

/**
 * @swagger
 * /api/auth-user/structures/all:
 *   get:
 *     summary: List structures that user can access to
 *     tags: [AuthUser]
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
router.get('/structures/all', async (req, res) => {
  await getAll(req, res);
});

/**
 * @swagger
 * /api/auth-user/structures:
 *   post:
 *     summary: Create new structure
 *     tags: [AuthUser]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/models/addStructure'
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
router.post('/structures', addValidationRules(), addValidate, async (req, res) => {
  await addOne(req, res);
});

/**
 * @swagger
 * /api/auth-user/structures/{code}:
 *   put:
 *     summary: Update structure
 *     tags: [AuthUser]
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
router.put('/structures/:code', codeValidationRules(), codeValidate, async (req, res) => {
  await updateOne(req, res);
});

/**
 * @swagger
 * /api/auth-user/structures/{code}:
 *   get:
 *     summary: Get a structure by code
 *     tags: [AuthUser]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: code
 *        required: true
 *        type: string
 *        value: test
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
router.get('/structures/:code', codeValidationRules(), codeValidate, async (req, res) => {
  await getOne(req, res);
});

module.exports = router;
