var https = require('https');
var retry = require('retry');
var Promise = require('bluebird');

function FCM(serverKey) {
    if (serverKey) {
        this.serverKey = serverKey;
    } else {
        throw Error('No serverKey is given.');
    }

    this.fcmOptions = {
        host: 'fcm.googleapis.com',
        port: 443,
        path: '/fcm/send',
        method: 'POST',
        headers: {}
    };
}

//callback function must follow node standard (err, data) => {}
FCM.prototype.send = function(payload, CB) {
    var self = this;
    if (!CB) console.log("asCallback will do nothing");

    return new Promise(function (resolve, reject){
        var operation = retry.operation();

        payload = JSON.stringify(payload);
        //copying the fcmOptions object to avoid problems in parallel calls
        var mFcmOptions = JSON.parse(JSON.stringify(self.fcmOptions));

        operation.attempt(function(currentAttempt) {
            var headers = {
                'Host': mFcmOptions.host,
                'Authorization': 'key=' + self.serverKey,
                'Content-Type': 'application/json',
                'Content-Length': new Buffer(payload).length
            };

            mFcmOptions.headers = headers;

            if (self.keepAlive) headers.Connection = 'keep-alive';

            var request = https.request(mFcmOptions, function(res) {
                var data = '';
                if (res.statusCode == 503) {
                    // If the server is temporary unavailable, the C2DM spec requires that we implement exponential backoff
                    // and respect any Retry-After header
                    if (res.headers['retry-after']) {
                        var retrySeconds = res.headers['retry-after'] * 1; // force number
                        if (isNaN(retrySeconds)) {
                            // The Retry-After header is a HTTP-date, try to parse it
                            retrySeconds = new Date(res.headers['retry-after']).getTime() - new Date().getTime();
                        }
                        if (!isNaN(retrySeconds) && retrySeconds > 0) {
                            operation._timeouts['minTimeout'] = retrySeconds;
                        }
                    }
                    if (!operation.retry('TemporaryUnavailable')) {
                        CB(operation.mainError(), null);
                    }
                    // Ignore all subsequent events for this request
                    return;
                }

                function respond() {
                    var error = null, id = null;

                    if (data.indexOf('\"multicast_id\":') > -1) {
                        //handle multicast_id, send by devive token
                        var anyFail = ((JSON.parse(data)).failure > 0);

                        if (anyFail) {
                            var isResults = ((JSON.parse(data)).results);
                            if  (isResults) {
                                error = isResults[0].error;
                            } else {    
                                error = data.substring(0).trim();
                            }
                        }

                        var anySuccess = ((JSON.parse(data)).success > 0);

                        if (anySuccess) {
                            id = data.substring(0).trim();
                        }
                    } else if (data.indexOf('\"message_id\":') > -1) {
                        //handle topics send
                        id = data;
                    } else if (data.indexOf('\"error\":') > -1){
                        error = data;
                    } else if (data.indexOf('Unauthorized') > -1) {
                        error = 'NotAuthorizedError';
                    } else {
                        error = 'InvalidServerResponse';
                    }

                    // Only retry if error is QuotaExceeded or DeviceQuotaExceeded
                    if (operation.retry(currentAttempt <= 3 && ['QuotaExceeded', 'DeviceQuotaExceeded', 'InvalidServerResponse'].indexOf(error) >= 0 ? error : null)) {
                        return;
                    }

                    // Success, return message id (without id=), or something error happened
                    if (id) resolve(id);
                    if (error) reject(error);
                }

                res.on('data', function(chunk) {
                    data += chunk;
                });
                res.on('end', respond);
                res.on('close', respond);
            });

            request.on('error', function(error) {
                reject(error);
            });

            request.end(payload);
        });
    }).asCallback(CB);
};

module.exports = FCM;
