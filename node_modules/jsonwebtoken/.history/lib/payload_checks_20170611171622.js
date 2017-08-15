var TokenExpiredError = require('./TokenExpiredError');
var JsonWebTokenError = require('./JsonWebTokenError');
var ms = require('ms');

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
  require('./verify_checks/exp'),
  require('./verify_checks/aud'),
  issCheck,
  subCheck,
  jtiCheck,
  maxAgeCheck
];

module.exports.PayloadVerifier = PayloadVerifier;
