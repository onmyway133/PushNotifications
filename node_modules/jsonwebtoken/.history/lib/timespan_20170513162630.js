var ms = require('ms');

module.exports = function (timeOffset, currentTimestamp) {
  currentTimestamp = iat || Math.floor(Date.now() / 1000);

  if (typeof timeOffset === 'string') {
    var milliseconds = ms(timeOffset);
    if (typeof milliseconds === 'undefined') {
      return;
    }
    return Math.floor(currentTimestamp + milliseconds / 1000);
  } else if (typeof timeOffset === 'number') {
    return currentTimestamp + timeOffset;
  } else {
    return;
  }
};