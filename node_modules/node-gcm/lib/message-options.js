/**
 * This module defines all the arguments that may be passed to a message.
 * 
 * Each argument may contain a field `__argName`, if the name of the field
 * should be different when sent to the server.
 * 
 * The argument may also contain a field `__argType`, if the given
 * argument must be of that type. The types are the strings resulting from
 * calling `typeof <arg>` where `<arg>` is the argument.
 * 
 * Other than that, the arguments are expected to follow the indicated
 * structure.
 */

module.exports = {
	collapseKey: {
        __argName: "collapse_key",
        __argType: "string"
    },
    priority: {
        __argType: "string"
    },
    contentAvailable: {
        __argName: "content_available",
        __argType: "boolean"
    },
    mutableContent: {
        __argName: "mutable_content",
        __argType: "boolean"
    },
	delayWhileIdle: {
        __argName: "delay_while_idle",
        __argType: "boolean"
    },
    timeToLive: {
        __argName: "time_to_live",
        __argType: "number"
    },
    restrictedPackageName: {
        __argName: "restricted_package_name",
        __argType: "string"
    },
    dryRun: {
        __argName: "dry_run",
        __argType: "boolean"
    },
    data: {
        __argType: "object"
    },
    notification: {
        __argType: "object"
        //TODO: There are a lot of very specific arguments that could
        //      be indicated here.
    }
};
