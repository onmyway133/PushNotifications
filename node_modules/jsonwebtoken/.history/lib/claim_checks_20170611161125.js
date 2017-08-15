function nbfCheck(claims, userOptions, context, next) {
  if (options.ignoreNotBefore) { return next(); }
  if (typeof payload.nbf === 'undefined') { return next(); }

  if (typeof payload.nbf !== 'number') {
    return next(new JsonWebTokenError('invalid nbf value'));
  }

  // context.clockTolerance = (options.clockTolerance || 0)
  if (payload.nbf > context.clockTimestamp + context.clockTolerance) {
    return next(new NotBeforeError('jwt not active', new Date(payload.nbf * 1000)));
  }

  next();
}

var ClaimCheck = function(){
  this.checks = [ nbfCheck ];
}

ClaimCheck.prototype.eval = function(claims, userOptions, context, done) {
  var i = 0;
  function evalNext(err) {
    if (err) { return done(err); }

    var check = this.checks[i++];
    if (!check) {
      return done();
    }

    check(claims, userOptions, context, evalNext);
  }
  evalNext();
};

