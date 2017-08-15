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

// refreshOptions.verify = options you would use with verify function
// refreshOptions.jwtid = contains the id for the new token
TokenGenerator.prototype.refresh = function(token, refreshOptions) {
  const payload = jwt.verify(payload, this.secretOrPrivateKey, refreshOptions.verify);
  delete payload.iat;
  delete payload.jti; //We are generating a new token, if you are using jwtid during signing,
  return jwt.sign(payload, this.secretOrPrivateKey, this.headerOptions);
}


