function nbfCheck(claims, userOptions, context, callback) {
  if (options.ignoreNotBefore) { return callback(); }
  if (typeof payload.nbf === 'undefined') { return callback(); }

  if (typeof payload.nbf !== 'number') {
    return callback(new JsonWebTokenError('invalid nbf value'));
  }

  // context.clockTolerance = (options.clockTolerance || 0)
  if (payload.nbf > context.clockTimestamp + context.clockTolerance) {
    return callback(new NotBeforeError('jwt not active', new Date(payload.nbf * 1000)));
  }

  callback();
}

var ClaimCheck = function(){
  this.checks = [ nbfCheck ];
}

ClaimCheck.prototype.eval = function(claims, userOptions, context, done) {
  var i = 0;
  function evalNext(err) {
    if (i >= this.checks.length) { return done(err); }
    var check = this.checks[i++];

  }
};

