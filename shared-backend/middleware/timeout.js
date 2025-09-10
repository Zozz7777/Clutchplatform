const timeout = require('connect-timeout');

const timeoutMiddleware = timeout('30s');

const haltOnTimedout = (req, res, next) => {
  if (!req.timedout) next();
};

module.exports = { timeoutMiddleware, haltOnTimedout };
