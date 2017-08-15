const jwt = require('./')

function TokenGenerator (secretOrPrivateKey, secretOrPublicKey) {
  this.secretOrPrivateKey = secretOrPrivateKey;
  this.secretOrPublicKey = secretOrPublicKey;
}

TokenGenerator.prototype.sign()

