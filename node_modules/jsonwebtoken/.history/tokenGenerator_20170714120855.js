const jwt = require('./')

function TokenGenerator (secretOrPrivateKey, secretOrPublicKey, headerOptions) {
  this.secretOrPrivateKey = secretOrPrivateKey;
  this.secretOrPublicKey = secretOrPublicKey;
  this.headerOptions = headerOptions; //algorithm + keyid
}

TokenGenerator.prototype.sign = function(payload, options) {
  const signOptions = Object.assign({}, options, this.headerOptions);
  return jwt.sign(payload, this.secretOrPrivateKey, options);
}

TokenGenerator.prototype.refresh = function(token, verifyOptions) {
  const payload = jwt.verify(payload, this.secretOrPrivateKey, verifyOptions);
  delete payload.iat;
  delete payload.jti;
  return jwt.sign(payload, this.secretOrPrivateKey, options);

}


