var payloadChecks = require('./payload-checks');

var Check = function (checkFn, options) {
  this.checkFn = checkFn;
  this.options = options;
}

Check.prototype.eval = function (payload, context) {
  this.checkFn(payload, this.options, context);
}

function buildCheckFromString(checkName) {
  return new Check(payloadChecks[checkName], {});
}

function buildCheckFromObject(checkObj) {
  var checkName = Object.keys(checkObj)[0];
  return new Check(payloadChecks[checkName], checkObj[checkName]);
}

function buildCheckFromFunction(checkFn) {
  return new Check(checkFn, {});
}

var builders = {
  'string': buildCheckFromString,
  'object': buildCheckFromObject,
  'function': buildCheckFromFunction
};

var PayloadVerifier = function () {
  this.checks = [];
}

PayloadVerifier.prototype.use = function (check) {
  var buildCheck = builders[typeof check];
  if (!buildCheck) {
    throw new Error('Payload check type not supported: ' + typeof check);
  }

  this.checks.push(buildCheck(check));
};

PayloadVerifier.prototype.eval = function (payload, context) {
  var i;
  var checkError;
  for (i = 0; i < this.checks.length; i++) {
    checkError = this.checks[i].eval(payload, context);
    if (checkError) {
      return checkError;
    }
  }
};

module.exports = PayloadVerifier;
