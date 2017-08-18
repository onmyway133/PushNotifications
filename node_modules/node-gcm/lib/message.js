var messageOptions = require("./message-options");

function Message(raw) {
    if (!(this instanceof Message)) {
        return new Message(raw);
    }
    this.params = cleanParams(raw || {});
}

function cleanParams(raw) {
    var params = {};
    Object.keys(raw).forEach(function(param) {
        if(messageOptions[param]) {
            params[param] = raw[param];
        }
    });
    return params;
}

Message.prototype.addNotification = function() {
    return handleParamSet.call(this, arguments, "notification");
};

function handleParamSet(args, paramType) {
    if(args.length == 1) {
        return setParam.call(this, paramType, args[0]);
    }
    if(args.length == 2) {
        return addParam.call(this, paramType, args[0], args[1]);
    }
    throw new Error("Invalid number of arguments given to for setting " + paramType + " (" + args.length + ")");
}

function setParam(paramType, obj) {
    if (typeof obj === 'object' && Object.keys(obj).length > 0) {
        this.params[paramType] = obj;
    }
}

function addParam(paramType, key, value) {
    if(!this.params[paramType]) {
        this.params[paramType] = {};
    }
    return this.params[paramType][key] = value;
}

Message.prototype.addData = function() {
    return handleParamSet.call(this, arguments, "data");
};

Message.prototype.toJson = function() {
    var json = {};

    Object.keys(this.params).forEach(function(param) {
        var optionDescription = messageOptions[param];
        if(!optionDescription) {
            return;
        }
        var key = optionDescription.__argName || param;
        json[key] = this.params[param];
    }.bind(this));

    return json;
};

/** DEPRECATED */

Message.prototype.addDataWithKeyValue = function (key, value) {
    console.warn("Message#addDataWithKeyValue has been deprecated. Please use Message#addData instead.");
    this.addData(key, value);
};

Message.prototype.addDataWithObject = function (obj) {
    console.warn("Message#addDataWithObject has been deprecated. Please use Message#addData instead.");
    this.addData(obj);
};

/** END DEPRECATED */

module.exports = Message;
