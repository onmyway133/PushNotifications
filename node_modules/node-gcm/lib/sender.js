var Constants = require('./constants');
var _ = require('lodash');
var request = require('request');
var debug = require('debug')('node-gcm');

function Sender(key, options) {
    if (!(this instanceof Sender)) {
        return new Sender(key, options);
    }

    this.key = key;
    this.options = options || {};
}

Sender.prototype.send = function(message, recipient, options, callback) {
    if(typeof options == "function") {
        callback = options;
        options = null;
    }
    else if(!callback) {
        callback = function() {};
    }
    options = cleanOptions(options);

    if(message.params && message.params.data && message.params.data.from) {
        console.warn("Sending a notification with the 'from' data attribute may invoke a 400 Bad Request by FCM.");
    }

    if(options.retries == 0) {
        return this.sendNoRetry(message, recipient, callback);
    }

    var self = this;

    this.sendNoRetry(message, recipient, function(err, response, attemptedRegTokens) {
        if (err) {
            // Attempt to determine HTTP status code
            var statusCode = typeof err === 'number' ? err : (err.code || 0);

            // 4xx error?
            if (statusCode > 399 && statusCode < 500) {
                debug("Error 4xx -- no use retrying. Something is wrong with the request (probably authentication?)");
                return callback(err);
            }
            return retry(self, message, recipient, options, callback);
        }
        if(!response.results) {
            return callback(null, response);
        }
        checkForBadTokens(response.results, attemptedRegTokens, function(err, unsentRegTokens, regTokenPositionMap) {
            if(err) {
                return callback(err);
            }
            if (unsentRegTokens.length == 0) {
                return callback(null, response);
            }

            debug("Retrying " + unsentRegTokens.length + " unsent registration tokens");

            retry(self, message, unsentRegTokens, options, function(err, retriedResponse) {
                if(err) {
                    return callback(null, response);
                }
                response = updateResponse(response, retriedResponse, regTokenPositionMap, unsentRegTokens);
                callback(null, response);
            });
        });
    });
};

function cleanOptions(options) {
    if(!options || typeof options != "object") {
        var retries = 5;
        if(typeof options == "number") {
            retries = options;
        }
        return {
            retries: retries,
            backoff: Constants.BACKOFF_INITIAL_DELAY
        };
    }

    if(typeof options.retries != "number") {
        options.retries = 5;
    }
    if(typeof options.backoff != "number") {
        options.backoff = Constants.BACKOFF_INITIAL_DELAY;
    }
    if (options.backoff > Constants.MAX_BACKOFF_DELAY) {
        options.backoff = Constants.MAX_BACKOFF_DELAY;
    }

    return options;
}

function retry(self, message, recipient, options, callback) {
    return setTimeout(function() {
        self.send(message, recipient, {
            retries: options.retries - 1,
            backoff: options.backoff * 2
        }, callback);
    }, options.backoff);
}

function checkForBadTokens(results, originalRecipients, callback) {
    var unsentRegTokens = [];
    var regTokenPositionMap = [];
    for (var i = 0; i < results.length; i++) {
        if (results[i].error === 'Unavailable') {
            regTokenPositionMap.push(i);
            unsentRegTokens.push(originalRecipients[i]);
        }
    }
    nextTick(callback, null, unsentRegTokens, regTokenPositionMap);
}

function updateResponse(response, retriedResponse, regTokenPositionMap, unsentRegTokens) {
    updateResults(response.results, retriedResponse.results, regTokenPositionMap);
    updateResponseMetaData(response, retriedResponse, unsentRegTokens);
    return response;
}

function updateResults(results, retriedResults, regTokenPositionMap) {
    for(var i = 0; i < results.length; i++) {
        results[regTokenPositionMap[i]] = retriedResults[i];
    }
}

function updateResponseMetaData(response, retriedResponse, unsentRegTokens) {
    response.success += retriedResponse.success;
    response.canonical_ids += retriedResponse.canonical_ids;
    response.failure -= unsentRegTokens.length - retriedResponse.failure;
}

Sender.prototype.sendNoRetry = function(message, recipient, callback) {
    if(!callback) {
        callback = function() {};
    }

    getRequestBody(message, recipient, function(err, body) {
        if(err) {
            return callback(err);
        }

        //Build request options, allowing some to be overridden
        var request_options = _.defaultsDeep({
            method: 'POST',
            headers: {
                'Authorization': 'key=' + this.key
            },
            uri: Constants.GCM_SEND_URI,
            json: body
        }, this.options, {
            timeout: Constants.SOCKET_TIMEOUT
        });

        request(request_options, function (err, res, resBodyJSON) {
            if (err) {
                return callback(err);
            }
            if (res.statusCode >= 500) {
                debug('GCM service is unavailable (500)');
                return callback(res.statusCode);
            }
            if (res.statusCode === 401) {
                debug('Unauthorized (401). Check that your API token is correct.');
                return callback(res.statusCode);
            }
            if (res.statusCode !== 200) {
                debug('Invalid request (' + res.statusCode + '): ' + resBodyJSON);
                return callback(res.statusCode);
            }
            if (!resBodyJSON) {
                debug('Empty response received (' + res.statusCode + ' ' + res.statusMessage + ')');
                // Spoof error code 400 to avoid retrying the request
                return callback({error: res.statusMessage, code: 400});
            }
            callback(null, resBodyJSON, body.registration_ids || [ body.to ]);
        });
    }.bind(this));
};

function getRequestBody(message, recipient, callback) {
    var body = message.toJson();

    if(typeof recipient == "string") {
        body.to = recipient;
        return nextTick(callback, null, body);
    }
    if(Array.isArray(recipient)) {
        if(!recipient.length) {
            return nextTick(callback, 'No recipient provided!');
        }
        else if(recipient.length == 1) {
            body.to = recipient[0];
            return nextTick(callback, null, body);
        }
        body.registration_ids = recipient;
        return nextTick(callback, null, body);
    }
    if (typeof recipient == "object") {
        return extractRecipient(recipient, function(err, recipient) {
            if(err) {
                return callback(err);
            }
            if (Array.isArray(recipient)) {
                body.registration_ids = recipient;
                return callback(null, body);
            }
            if ((/\|\||&&/).test(recipient)) {
              body.condition = recipient;
              return callback(null, body);
            }
            body.to = recipient;
            return callback(null, body);
        });
    }
    return nextTick(callback, 'Invalid recipient (' + recipient + ', type ' + typeof recipient + ') provided!');
}

function nextTick(func) {
    var args = Array.prototype.slice.call(arguments, 1);
    process.nextTick(function() {
        func.apply(this, args);
    }.bind(this));
}

function extractRecipient(recipient, callback) {
    var recipientKeys = Object.keys(recipient);

    if(recipientKeys.length !== 1) {
        return nextTick(callback, new Error("Please specify exactly one recipient key (you specified [" + recipientKeys + "])"));
    }

    var key = recipientKeys[0];
    var value  = recipient[key];

    if(!value) {
        return nextTick(callback, new Error("Falsy value for recipient key '" + key + "'."));
    }

    var keyValidators = {
        to: isString,
        topic: isString,
        condition: isString,
        notificationKey: isString,
        registrationIds: isArray,
        registrationTokens: isArray
    };

    var validator = keyValidators[key];
    if(!validator) {
        return nextTick(callback, new Error("Key '" + key + "' is not a valid recipient key."));
    }
    if(!validator(value)) {
        return nextTick(callback, new Error("Recipient key '" + key + "' was provided as an incorrect type."));
    }

    return nextTick(callback, null, value);
}

function isString(x) {
    return typeof x == "string";
}

function isArray(x) {
    return Array.isArray(x);
}

module.exports = Sender;
