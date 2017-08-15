var payloadChecks = require('./payload-checks');

var PayloadVerifier = function () {
  this.checks = [];
}

PayloadVerifier.prototype.use = function (check) {
  this.checks.push(check);
};

PayloadVerifier.prototype.eval = function (payload, context) {
  var i;
  var checkError;
  var checkFn;
  var checkOptions = {};
  var checkName;
  for (i = 0; i < this.checks.length; i++) {
    if (typeof this.checks[i] === 'string') {
      checkName = this.checks[i];
    } else if (typeof this.checks[i] === 'object') {
      checkName = Object.keys(this.checks[i])[0];
      checkOptions = this.checks[i][checkName];
    }

    checkFn = payloadChecks[checkName];

    checkError = checkFn(payload, checkOptions, context);
    if (checkError) {
      return checkError;
    }
  }
};

module.exports = PayloadVerifier;
