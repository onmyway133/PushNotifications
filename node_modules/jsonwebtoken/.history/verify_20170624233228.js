var JsonWebTokenError = require('./lib/JsonWebTokenError');
// var NotBeforeError    = require('./lib/NotBeforeError');
// var TokenExpiredError = require('./lib/TokenExpiredError');
var decode            = require('./decode');
var payloadChecks       = require('./lib/payload_checks');
var jws               = require('jws');
// var ms                = require('ms');
var xtend             = require('xtend');

module.exports = function (jwtString, secretOrPublicKey, options, callback) {
  if ((typeof options === 'function') && !callback) {
    callback = options;
    options = {};
  }

  if (!options) {
    options = {};
  }

  //clone this object since we are going to mutate it.
  options = xtend(options);
  var done;

  if (callback) {
    done = function() {
      var args = Array.prototype.slice.call(arguments, 0);
      return process.nextTick(function() {
        callback.apply(null, args);
      });
    };
  } else {
    done = function(err, data) {
      if (err) throw err;
      return data;
    };
  }

  if (options.clockTimestamp && typeof options.clockTimestamp !== 'number') {
    return done(new JsonWebTokenError('clockTimestamp must be a number'));
  }

  if (!jwtString){
    return done(new JsonWebTokenError('jwt must be provided'));
  }

  if (typeof jwtString !== 'string') {
    return done(new JsonWebTokenError('jwt must be a string'));
  }

  var parts = jwtString.split('.');

  if (parts.length !== 3){
    return done(new JsonWebTokenError('jwt malformed'));
  }

  var hasSignature = parts[2].trim() !== '';

  if (!hasSignature && secretOrPublicKey){
    return done(new JsonWebTokenError('jwt signature is required'));
  }

  if (hasSignature && !secretOrPublicKey) {
    return done(new JsonWebTokenError('secret or public key must be provided'));
  }

  if (!hasSignature && !options.algorithms) {
    options.algorithms = ['none'];
  }

  if (!options.algorithms) {
    options.algorithms = ~secretOrPublicKey.toString().indexOf('BEGIN CERTIFICATE') ||
                         ~secretOrPublicKey.toString().indexOf('BEGIN PUBLIC KEY') ?
                          [ 'RS256','RS384','RS512','ES256','ES384','ES512' ] :
                         ~secretOrPublicKey.toString().indexOf('BEGIN RSA PUBLIC KEY') ?
                          [ 'RS256','RS384','RS512' ] :
                          [ 'HS256','HS384','HS512' ];

  }

  var decodedToken;
  try {
    decodedToken = jws.decode(jwtString);
  } catch(err) {
    return done(err);
  }

  if (!decodedToken) {
    return done(new JsonWebTokenError('invalid token'));
  }

  var header = decodedToken.header;

  if (!~options.algorithms.indexOf(header.alg)) {
    return done(new JsonWebTokenError('invalid algorithm'));
  }

  var valid;

  try {
    valid = jws.verify(jwtString, header.alg, secretOrPublicKey);
  } catch (e) {
    return done(e);
  }

  if (!valid)
    return done(new JsonWebTokenError('invalid signature'));

  var payload;

  try {
    payload = decode(jwtString);
  } catch(err) {
    return done(err);
  }

  var context = {
    clockTimestamp: options.clockTimestamp || Math.floor(Date.now() / 1000),
    clockTolerance: options.clockTolerance || 0
  };

  var payloadVerifier = new payloadChecks.PayloadVerifier();
  if (!options.ignoreNotBefore) {
    payloadVerifier.use('nbf');
  }
  if (!options.ignoreExpiration) {
    payloadVerifier.use('exp');
  }
  payloadVerifier.use({ maxAge: options.maxAge });
  payloadVerifier.use({ audience: options.audience });
  payloadVerifier.use({ issuer: options.issuer });
  payloadVerifier.use({ subject: options.subject });
  payloadVerifier.use({ jwtid: options.jwtid });

  var checkError = payloadVerifier.eval(payload, options, context);
  if (checkError) {
    return done(checkError);
  }

  return done(null, payload);
};
