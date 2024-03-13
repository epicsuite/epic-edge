const { body, validationResult } = require('express-validator');

const validationRules = () => [
  body('id').trim().matches(/^\d{4}$/).withMessage('Invalid dataset id, must be a 4 digits numeric string.'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const resultErrors = { error: {}, message: 'Validation failed', success: false };
  errors.array().forEach(err => { resultErrors.error[err.param] = err.msg; });
  return res.status(400).json(resultErrors);
};

module.exports = {
  validationRules,
  validate,
};
