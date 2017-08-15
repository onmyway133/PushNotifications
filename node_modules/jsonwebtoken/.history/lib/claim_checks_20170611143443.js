function nbfCheck(claims, userOptions, context) {
  if (options.ignoreNotBefore) { return; }
  if (typeof payload.nbf === 'undefined') { return; }

  if (typeof payload.nbf !== 'number') {
    return new JsonWebTokenError('invalid nbf value');
  }

  // context.clockTolerance = (options.clockTolerance || 0)
  if (payload.nbf > context.clockTimestamp + context.clockTolerance) {
    return new NotBeforeError('jwt not active', new Date(payload.nbf * 1000));
  }

  return;
}

var ClaimCheck = function(){
  this.checks = [ nbfCheck ];
}

ClaimCheck.prototype.eval = function(claims, userOptions, context) {

};

