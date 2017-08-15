var PayloadVerifier = function () {
  this.checks = [];
}

PayloadVerifier.prototype.use = function (checks) {
  if (Array.isArray(checks)) {
    this.checks = this.checks.concat(checks);
  } else {
    this.checks.push(checks);
  }
  return this;
};

PayloadVerifier.prototype.eval = function (payload, options, context) {
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

    checkFn = module.exports.checks[checkName]; //TODO add defensive code for else cases

    checkError = checkFn(payload, checkOptions, context);
    if (checkError) {
      return checkError;
    }
  }
};

module.exports.PayloadVerifier = PayloadVerifier;
