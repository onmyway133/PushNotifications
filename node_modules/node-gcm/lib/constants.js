var Constants = {
    'GCM_SEND_ENDPOINT' : 'fcm.googleapis.com',
    'GCM_SEND_ENDPATH' : '/fcm/send',
    'GCM_SEND_URI' : 'https://fcm.googleapis.com/fcm/send',
    'BACKOFF_INITIAL_DELAY' : 1000,
    'MAX_BACKOFF_DELAY' : 1024000  ,
    'SOCKET_TIMEOUT' : 180000, //three minutes

    /** DEPRECATED **/

    'TOKEN_MESSAGE_ID' : 'id',
    'TOKEN_CANONICAL_REG_ID' : 'registration_id',
    'TOKEN_ERROR' : 'Error',
    'JSON_REGISTRATION_IDS' : 'registration_ids',
    'JSON_PAYLOAD' : 'data',
    'JSON_NOTIFICATION' : 'notification',
    'JSON_SUCCESS' : 'success',
    'JSON_FAILURE' : 'failure',
    'JSON_CANONICAL_IDS' : 'canonical_ids',
    'JSON_MULTICAST_ID' : 'multicast_id',
    'JSON_RESULTS' : 'results',
    'JSON_ERROR' : 'error',
    'JSON_MESSAGE_ID' : 'message_id',
    'UTF8' : 'UTF-8',

    //These errors could probably be structured more nicely, and could be used in the code.
    // -- maybe just as an Error abstraction?
    'ERROR_QUOTA_EXCEEDED' : 'QuotaExceeded',
    'ERROR_DEVICE_QUOTA_EXCEEDED' : 'DeviceQuotaExceeded',
    'ERROR_MISSING_REGISTRATION' : 'MissingRegistration',
    'ERROR_INVALID_REGISTRATION' : 'InvalidRegistration',
    'ERROR_MISMATCH_SENDER_ID' : 'MismatchSenderId',
    'ERROR_NOT_REGISTERED' : 'NotRegistered',
    'ERROR_MESSAGE_TOO_BIG' : 'MessageTooBig',
    'ERROR_MISSING_COLLAPSE_KEY' : 'MissingCollapseKey',
    'ERROR_UNAVAILABLE' : 'Unavailable'

    /** END DEPRECATED **/
};

module.exports = Constants;
