const { body, validationResult } = require('express-validator');

const validationRules = () => [
  body('id').trim().matches(/^[a-zA-Z]{3}-[a-zA-Z0-9]{8}$/).withMessage('Invalid product id.'),
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
