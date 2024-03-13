const router = require('express').Router();
const { validationRules: codeValidationRules, validate: codeValidate } = require('../validations/code-validator');
const { validationRules: addValidationRules, validate: addValidate } = require('../validations/dataset-validator');
const {
  addOne,
  getOne,
  updateOne,
  getOwn,
  getAll,
} = require('../controllers/auth-user-dataset-controller');

/**
 * @swagger
 * /api/auth-user/datasets:
 *   get:
 *     summary: List datasets owned by user
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
router.get('/datasets', async (req, res) => {
  await getOwn(req, res);
});

/**
 * @swagger
 * /api/auth-user/datasets/all:
 *   get:
 *     summary: List datasets that user can access to
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
router.get('/datasets/all', async (req, res) => {
  await getAll(req, res);
});

/**
 * @swagger
 * /api/auth-user/datasets:
 *   post:
 *     summary: Create new dataset
 *     tags: [AuthUser]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/models/addDataset'
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
router.post('/datasets', addValidationRules(), addValidate, async (req, res) => {
  await addOne(req, res);
});

/**
 * @swagger
 * /api/auth-user/datasets/{code}:
 *   put:
 *     summary: Update dataset
 *     tags: [AuthUser]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: code
 *        required: true
 *        type: string
 *        value: test
 *        description: The dataset unique code.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/models/updateDataset'
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
router.put('/datasets/:code', codeValidationRules(), codeValidate, async (req, res) => {
  await updateOne(req, res);
});

/**
 * @swagger
 * /api/auth-user/datasets/{code}:
 *   get:
 *     summary: Get a dataset by code
 *     tags: [AuthUser]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: code
 *        required: true
 *        type: string
 *        value: test
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
router.get('/datasets/:code', codeValidationRules(), codeValidate, async (req, res) => {
  await getOne(req, res);
});

module.exports = router;
