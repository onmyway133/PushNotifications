var JsonWebTokenError = require('./lib/JsonWebTokenError');
var decode            = require('./decode');
var PayloadVerifier   = require('./lib/verify/PayloadVerifier');
var jws               = require('jws');
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
    clockTolerance: options.clockTolerance || 0,
    //PR-REVIEW: We need to pass this for maxAge so far, it may not make sense
    //           to pass it once maxAge works with seconds.
    verifyOptions: options
  };

  var payloadVerifier = new PayloadVerifier();
  if (!options.ignoreNotBefore) {
    payloadVerifier.use('nbf');
  }
  if (!options.ignoreExpiration) {
    payloadVerifier.use('exp');
  }
  payloadVerifier.use({ audience: options.audience });
  payloadVerifier.use({ issuer: options.issuer });
  payloadVerifier.use({ subject: options.subject });
  payloadVerifier.use({ jwtid: options.jwtid });
  payloadVerifier.use({ maxAge: options.maxAge });

  /* PR-REVIEW:
      The idea once we have decided the contract is to enable
      consumers to send exactly what checks they want to perform
      or omit it to let apply the defaults (nbf and exp).
      One example of calling at that stage could be ie::
        jwt.verify(token, secret, {
          ... options for the operation (clockTolerance, clockTimespan, algorithms)
          payloadChecks: [
            'nbf',
            { audience: 'https://myaud.com' },
            { role: (payload) => payload.role === 'admin' } // Passing custom checks somehow
          ]
        })
  */

  var checkError = payloadVerifier.eval(payload, context);
  if (checkError) {
    return done(checkError);
  }

  return done(null, payload);
};
