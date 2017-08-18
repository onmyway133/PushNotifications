Changelog
=========

**0.14.6**
 * Support for ios mutable-content (PR #297, thanks @SemonCat)

**0.14.5**
 * Added support for multiple topics using FCM condition
 * Added `--save` to npm install command in README
 * Warn when sending a message with `data.from` in its payload
 * Document `message.addNotification` behavior when app is in foreground
 * Update `request` to `2.81.0` to resolve security vulnerability
 * Support empty JSON response from Firebase Cloud Messaging due to invalid notification key

**0.14.2**
 * Updated README, added note on v1 development

**0.14.1**
 * Major refactorings of internals.
 * Marked some constants, Result, and MulticastResult as deprecated.
 * Changed to using new Firebase Cloud Messaging URL.
 * Small README fixes.

**0.14.0**
 * Added support for `to` recipient keys.
   This means that it is now possible to explicitly set something that should go in the `to` field in the request sent to GCM.
 * Added some compatibility documentation.

**0.13.1**
 * Improvements to the way we set the recipient arguments before sending requests to GCM.
   We now prefer the `to` field whenever applicable.
 * Simplified parsing of recipient objects, and added documentation of supported keys in [README](https://github.com/ToothlessGear/node-gcm/blob/master/README.md#recipients).
 * Sender#send will now fail faster (never retry) if a 4xx error code is returned from GCM: something was wrong with the request.
 * Fixed support for using node-gcm through a proxy.

**0.13.0**
 * It is now possible to set *any* option that can be set in [request](https://github.com/request/request).
   See the [Custom GCM request options](https://github.com/ToothlessGear/node-gcm#custom-gcm-request-options) section of the README.
 * We have changed the recommended name for what the `Sender` returns from `result` to `response`.

**0.12.1**
 * Updates to the README
 * Changed terminology from "Registration ID" to "Registration Token" to be consistent with the GCM documentation.
 * Updated GCM service endpoint (was changed by Google, old one is deprecated)

**0.12.0**
 * Added support of explicit recipients (`registration_ids`, `topic`, `notification_key`) in Sender.

**0.11.1**
 * Fixed support for `priority` and corresponding documentation.

**0.11.0**
 * Added support for the [new parameters](https://developers.google.com/cloud-messaging/server-ref):
   `priority`, `content_available`, `restricted_package_name`.
 * If only a single registration token is passed to `Sender#send*`, it will be sent in the `to` field.
   This is in accordance with the best practice of the current documentation, and allows users to send messages to notification keys.
 * It is no longer possible to change internal state of `Message`s by changing the variables directly.
   For example, `message.collapseKey = "New Key"` is now illegal (won't work).
   This is not considered a breaking change, because fiddling with internal state should not happen outside of the provided interface.
   In this case, the correct way to set message variables is on construction of the `Message`.

**0.10.0**
 * Deprecated `Message#addDataWithKeyValue` and `Message#addDataWithObject`:
   both of these now print a message to the log when used.
 * Fixed some typos and improved the README.
 * Updated dependencies.
 * Limited files included in package as a dependency (test-files are no longer gotten with `npm install`).
 * Fixed a bug which caused errors in the provided callback to result in retries.
 * Added `Message#addNotification`, which allows the user to use the new [Notification Payload API](https://developers.google.com/cloud-messaging/server-ref#notification-payload-support).
   This allows the server to define a notification that will be shown directly on the receiving device.

**0.9.15**
 * Updated *Contributing* section in README
 * Rewrote `Sender#send`, so it returns the correct result ordered as expected, even after retrying.
   The initial backoff time can now be specified, by passing an options object to the function.
 * Updated `Sender#send` and `Sender#sendNoRetry` to allow passing a single Registration Token without wrapping it in an array.

**0.9.14**
 * `Message#addData` is now multi-purpose (works as either `Message#addDataWithObject` or `Message#addDataWithKeyValue`)
 * clarified README usage example
 * clarified README debug section
 * made `Sender#send` have a default of 5 retries (if none provided)

**0.9.13**
 * print server responses on invalid requests while in debug mode
 * fixed engine version in package.json (now correctly states >= 10)
 * callbacks to `Sender#send` and `Sender#sendNoRetry` are now optional

**0.9.12**
 * added debug module and removed console-logs
 * use exponential retry instead of linear
 * update request module with most recent compatible one
 * remove require on global timers
 * various cleanups
 * add maxSockets option
 * keep 'this' on Sender object in retries
 * updated README
 * updated contributors

**0.9.11**
 * check >= 500 error status
 * just reassign id array on err, don't iterate
 * send err to callback
 * resend if send multiple errs
 * check for not result instead of result === undefined
 * updated README
 * updated contributors

**0.9.10**
 * Added dryRun message parameter
 * updated README
 * updated contributors

**0.9.9**
 * fix statusCode logging
 * Added a call of a callback function in case when no registration tokens were given
 * updated contributors

**0.9.8**
 * Added support for sending POSTs to GCM through http/https proxies.
 * updated contributors

**0.9.7**
 * move callback outside of try catch block
 * updated README
 * updated contributors

**0.9.6:**
 * fixed undefined "data" var
 * made constructor argument optional
 * added back addData method
 * updated README
 * updated contributors

**0.9.5:**
 * change addData to addDataWithKeyValue
 * add new function addDataWithObject
 * message object can be initialised with another object
 * updated contributors

**0.9.4:**
 * fix TypeError
 * updated contributors
 * updated README

**0.9.3:**
 * new callback-style (Please check the example above)
 * fixes various issues (Read commit messages)
 * not making a distinction between a single and multiple result makes it easier for application-land code to handle

**0.9.2:**
 * added error handler to HTTPS request to handle DNS exceptions
 * added multicast-messaging

**0.9.1:**
 * first release
