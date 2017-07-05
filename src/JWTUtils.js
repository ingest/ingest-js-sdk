'use strict';

/**
 * UTILS for dealing with jwt tokens.
 */

/**
 * Parse the payload out of the JWT token.
 * @param  {string} token JWT Token.
 * @return {object}       Parsed payload object.
 */
function parseTokenPayload (token) {
  var payload;
  var parts = token.split('.');

  // Return false if the token is invalid.
  if (parts.length <= 1) {
    return false;
  }

  // Decode the payload portion.
  payload = window.atob(parts[1]);

  // Parse it as JSON
  payload = JSON.parse(payload);

  return payload;
};

/**
 * Return true if the provided token has expired.
 * @param  {string}  token JWT Token
 * @return {Boolean}       True if expired.
 */
module.exports.isExpired = function (token) {
  var data, exp, result, now;

  data = parseTokenPayload(token);

  result = true;

  // Return true if the token does not parse properly.
  if (!data) {
    return result;
  }

  exp = data.exp;

  // Get the unix timestamp in seconds.
  now = new Date();
  now = now.getTime() / 1000;

  if (!exp) {
    return result;
  }

  // If the expiry data is still in the future.
  if (now < exp) {
    result = false;
  }

  return result;

};
