var TokenExpiredError = require('../TokenExpiredError');
var JsonWebTokenError = require('../JsonWebTokenError');

function expCheck(payload, options, context) {
  if (options.ignoreExpiration) { return; }
  if (typeof payload.exp === 'undefined') { return; }

  if (typeof payload.exp !== 'number') {
    return new JsonWebTokenError('invalid exp value');
  }

  if (context.clockTimestamp >= payload.exp + context.clockTolerance) {
    return new TokenExpiredError('jwt expired', new Date(payload.exp * 1000));
  }
}

module.exports = expCheck;