var NotBeforeError = require('./NotBeforeError');
var TokenExpiredError = require('./TokenExpiredError');
var JsonWebTokenError = require('./JsonWebTokenError');
var ms = require('ms');

function nbfCheck(payload, options, context) {
  if (typeof payload.nbf === 'undefined') { return; }

  if (typeof payload.nbf !== 'number') {
    return new JsonWebTokenError('invalid nbf value');
  }

  if (payload.nbf > context.clockTimestamp + context.clockTolerance) {
    return new NotBeforeError('jwt not active', new Date(payload.nbf * 1000));
  }
}

function expCheck(payload, options, context) {
  if (typeof payload.exp === 'undefined') { return; }

  if (typeof payload.exp !== 'number') {
    return new JsonWebTokenError('invalid exp value');
  }

  if (context.clockTimestamp >= payload.exp + context.clockTolerance) {
    return new TokenExpiredError('jwt expired', new Date(payload.exp * 1000));
  }
}

function audCheck(payload, audience, context) {
  if (!audience) { return; }

  var audiences = Array.isArray(audience) ? audience : [audience];
  var target = Array.isArray(payload.aud) ? payload.aud : [payload.aud];

  var match = target.some(function (aud) { return audiences.indexOf(aud) != -1; });

  if (!match) {
    return new JsonWebTokenError('jwt audience invalid. expected: ' + audiences.join(' or '));
  }
}

function issCheck(payload, issuer, context) {
  if (!issuer) { return; }

  var invalid_issuer =
    (typeof issuer === 'string' && payload.iss !== issuer) ||
    (Array.isArray(issuer) && issuer.indexOf(payload.iss) === -1);

  if (invalid_issuer) {
    return new JsonWebTokenError('jwt issuer invalid. expected: ' + issuer);
  }
}

function subCheck(payload, subject, context) {
  if (!subject) { return; }

  if (payload.sub !== subject) {
    return new JsonWebTokenError('jwt subject invalid. expected: ' + subject);
  }
}

function jtiCheck(payload, jwtid, context) {
  if (!jwtid) { return; }

  if (payload.jti !== jwtid) {
    return new JsonWebTokenError('jwt jwtid invalid. expected: ' + jwtid);
  }
}

function maxAgeCheck(payload, maxAge, context) {
  if (!maxAge) { return; }

  var maxAgeMillis = ms(maxAge);
  if (typeof payload.iat !== 'number') {
    return new JsonWebTokenError('iat required when maxAge is specified');
  }
  // We have to compare against either context.verifyOptions.clockTimestamp or the currentDate _with_ millis
  // to not change behaviour (version 7.2.1). Should be resolve somehow for next major.
  var nowOrClockTimestamp = ((context.verifyOptions.clockTimestamp || 0) * 1000) || Date.now();
  if (nowOrClockTimestamp - (payload.iat * 1000) > maxAgeMillis + context.clockTolerance * 1000) {
    return new TokenExpiredError('maxAge exceeded', new Date(payload.iat * 1000 + maxAgeMillis));
  }
}

//PR-REVIEW:
// - We can extract the checkers to its own individual file
// - Each check will have its own tests
module.exports.checks = {
  nbf: nbfCheck,
  exp: expCheck,
  audience: audCheck,
  issuer: issCheck,
  subject: subCheck,
  jwtid: jtiCheck,
  maxAge: maxAgeCheck
};

//PR-REVIEW: We can extract this to other file later
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
  var checkFn;
  var checkOptions = {};
  var checkName;
  for (i = 0; i < this.checks.length; i++) {
    if (typeof this.checks[i] === 'string') {
      checkName = this.checks[i];
    } else if (typeof this.checks[i] === 'object') {
      checkName = Object.keys(this.checks[i])[0];
      checkOptions = this.checks[i][checkName];
    }

    checkFn = module.exports.checks[checkName]; //TODO add defensive code for else cases

    checkError = checkFn(payload, checkOptions, context);
    if (checkError) {
      return checkError;
    }
  }
};

module.exports.PayloadVerifier = PayloadVerifier;
