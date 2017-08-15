var NotBeforeError = require('./NotBeforeError');

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

// var ClaimCheck = function(){
//   this.checks = [ nbfCheck ];
// }

var defaultChecks = [ nbfCheck, expCheck ];

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
  // var i = 0;
  // function evalNext(err) {
  //   if (err) { return done(err); }

  //   var check = this.checks[i++];
  //   if (!check) {
  //     return done();
  //   }

  //   check(claims, userOptions, context, evalNext);
  // }
  // evalNext();
};

module.exports.eval = evalChecks;

