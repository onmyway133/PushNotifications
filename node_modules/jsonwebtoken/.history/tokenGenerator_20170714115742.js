const jwt = require('./')

function TokenGenerator (secretOrPrivateKey, secretOrPublicKey, signOptions) {
  this.secretOrPrivateKey = secretOrPrivateKey;
  this.secretOrPublicKey = secretOrPublicKey;
  this.signOptions =
}

TokenGenerator.prototype.sign = function(payload, options) {
  return jwt.sign(payload, this.secretOrPrivateKey, options);
}

TokenGenerator.prototype.refresh = function(token, verifyOptions) {
  return jwt.v(payload, this.secretOrPrivateKey, verifyOptions);
}


