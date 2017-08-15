var NotBeforeError = require('./NotBeforeError');
var TokenExpiredError = require('./TokenExpiredError');
var JsonWebTokenError = require('./JsonWebTokenError');

function nbfCheck(payload, options, context) {
  if (options.ignoreNotBefore) { return; }
  if (typeof payload.nbf === 'undefined') { return; }

  if (typeof payload.nbf !== 'number') {
    return new JsonWebTokenError('invalid nbf value');
  }

  if (payload.nbf > context.clockTimestamp + context.clockTolerance) {
    return new NotBeforeError('jwt not active', new Date(payload.nbf * 1000));
  }
}

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

function audCheck(payload, options, context) {
  if (!options.audience) { return; }

  var audiences = Array.isArray(options.audience) ? options.audience : [options.audience];
  var target = Array.isArray(payload.aud) ? payload.aud : [payload.aud];

  var match = target.some(function (aud) { return audiences.indexOf(aud) != -1; });

  if (!match) {
    return new JsonWebTokenError('jwt audience invalid. expected: ' + audiences.join(' or '));
  }
}

function issCheck(payload, options, context) {
  if (!options.issuer) { return; }

  var invalid_issuer =
    (typeof options.issuer === 'string' && payload.iss !== options.issuer) ||
    (Array.isArray(options.issuer) && options.issuer.indexOf(payload.iss) === -1);

  if (invalid_issuer) {
    return new JsonWebTokenError('jwt issuer invalid. expected: ' + options.issuer);
  }
}

function subCheck(payload, options, context) {
  if (!options.subject) { return; }

  if (payload.sub !== options.subject) {
    return new JsonWebTokenError('jwt subject invalid. expected: ' + options.subject);
  }
}

// var ClaimCheck = function(){
//   this.checks = [ nbfCheck ];
// }

var defaultChecks = [ nbfCheck, expCheck, audCheck, issCheck, subCheck ];

// ClaimCheck.prototype.eval = function(claims, userOptions, context) {
function evalChecks(payload, options, context) {
  var i;
  var checkError;
  for (i = 0; i < defaultChecks.length; i++) {
    checkError = defaultChecks[i](payload, options, context);
    if (checkError) {
      return checkError;
    }
  }
};

module.exports.eval = evalChecks;

