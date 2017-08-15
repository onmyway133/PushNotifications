var JsonWebTokenError = require('../JsonWebTokenError');

function audCheck(payload, options, context) {
  if (!options.audience) { return; }

  var audiences = Array.isArray(options.audience) ? options.audience : [options.audience];
  var target = Array.isArray(payload.aud) ? payload.aud : [payload.aud];

  var match = target.some(function (aud) { return audiences.indexOf(aud) != -1; });

  if (!match) {
    return new JsonWebTokenError('jwt audience invalid. expected: ' + audiences.join(' or '));
  }
}

module.exports = audCheck;