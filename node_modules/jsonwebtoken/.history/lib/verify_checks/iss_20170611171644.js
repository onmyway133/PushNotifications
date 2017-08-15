var JsonWebTokenError = require('../JsonWebTokenError');

function issCheck(payload, options, context) {
  if (!options.issuer) { return; }

  var invalid_issuer =
    (typeof options.issuer === 'string' && payload.iss !== options.issuer) ||
    (Array.isArray(options.issuer) && options.issuer.indexOf(payload.iss) === -1);

  if (invalid_issuer) {
    return new JsonWebTokenError('jwt issuer invalid. expected: ' + options.issuer);
  }
}

module.exports = issCheck;