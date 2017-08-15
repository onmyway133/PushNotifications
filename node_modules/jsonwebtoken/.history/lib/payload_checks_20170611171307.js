var TokenExpiredError = require('./TokenExpiredError');
var JsonWebTokenError = require('./JsonWebTokenError');
var ms = require('ms');

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

function jtiCheck(payload, options, context) {
  if (!options.jwtid) { return; }

  if (payload.jti !== options.jwtid) {
    return new JsonWebTokenError('jwt jwtid invalid. expected: ' + options.jwtid);
  }
}

function maxAgeCheck(payload, options, context) {
  if (!options.maxAge) { return; }

  var maxAge = ms(options.maxAge);
  if (typeof payload.iat !== 'number') {
    return new JsonWebTokenError('iat required when maxAge is specified');
  }
  // We have to compare against either options.clockTimestamp or the currentDate _with_ millis
  // to not change behaviour (version 7.2.1). Should be resolve somehow for next major.
  var nowOrClockTimestamp = ((options.clockTimestamp || 0) * 1000) || Date.now();
  if (nowOrClockTimestamp - (payload.iat * 1000) > maxAge + context.clockTolerance * 1000) {
    return new TokenExpiredError('maxAge exceeded', new Date(payload.iat * 1000 + maxAge));
  }
}

var PayloadVerifier = function(){
  this.checks = [];
}

PayloadVerifier.prototype.use = function(checks) {
  if (Array.isArray(checks)) {
    this.checks = this.checks.concat(checks);
  } else {
    this.checks.push(checks);
  }
  return this;
};

PayloadVerifier.prototype.eval = function(payload, options, context) {
  var i;
  var checkError;
  for (i = 0; i < this.checks.length; i++) {
    checkError = this.checks[i](payload, options, context);
    if (checkError) {
      return checkError;
    }
  }
};

module.exports.defaultChecks = [
  require('./verify_checks/nbf'),
  expCheck,
  audCheck,
  issCheck,
  subCheck,
  jtiCheck,
  maxAgeCheck
];

module.exports.PayloadVerifier = PayloadVerifier;
