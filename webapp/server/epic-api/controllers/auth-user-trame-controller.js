const { startTrame } = require('../utils/trame');

// eslint-disable-next-line consistent-return
const trame = async (req, res) => {
  await startTrame(req, res, 'user');
};

module.exports = {
  trame,
};
