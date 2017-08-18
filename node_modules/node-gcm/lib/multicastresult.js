/** DEPRECATED **/

function MulitcastResult() {
    if (!(this instanceof MulitcastResult)) {
        return new MulitcastResult();
    }

    console.warn("You are using node-gcm MulticastResult, which is deprecated.");

    this.success = undefined;
    this.failure = undefined;
    this.canonicalIds = undefined;
    this.multicastId = undefined;
    this.results = [];
    this.retryMulticastIds = [];
}

MulitcastResult.prototype.addResult = function (result) {
    this.results.push(result);
};

MulitcastResult.prototype.getTotal = function () {
    return this.success + this.failure;
};

module.exports = MulitcastResult;

/** END DEPRECATED **/
