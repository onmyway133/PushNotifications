function nbfCheck(claims, options) {
  if (options.ignoreNotBefore) { return; }
  if (typeof payload.nbf === 'undefined') { return; }

  if (typeof payload.nbf !== 'number') {
    return new JsonWebTokenError('invalid nbf value');
  }
  if (payload.nbf > clockTimestamp + (options.clockTolerance || 0)) {
    return done(new NotBeforeError('jwt not active', new Date(payload.nbf * 1000)));
  }

  return false;
}

module.exports