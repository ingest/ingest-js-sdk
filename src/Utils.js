var Promise = require('pinkyswear');
var Utils = {};
/**
 * Replace all tokens within a given template based on the given key/value pair.
 * @param  {string}     template    Template for the url.
 * @param  {object}     hash        Key/Value pair for replacing tokens in the template.
 *
 * @example
 * var tokens = {
 *  keyInTemplate: 'replacedWith'
 * };
 *
 * var template = '<%=keyInTemplate%>';
 *
 * var result = parseTokens(template, tokens);  // 'replacedWith'
 *
 * @return {string}                 Parsed string.
 */
Utils.parseTokens = function (template, hash) {
  if (!template) {
    return null;
  }

  var keys = Object.keys(hash);
  var i;
  var length = keys.length;

  for (i = 0; i < length; i++) {
    template = template.replace('<%=' + keys[i] + '%>', hash[keys[i]]);
  }

  return template;
};

/**
 * Wrapper function to wrap a value in either a reject or resolve.
 * @param  {boolean} state Rejection or Approval.
 * @param  {*}       value Value to pass back to the promise.
 * @return {Promise}       Promise/A+ spec promise.
 */
Utils.promisify = function (state, value) {
  var promise = Promise();

  promise(state, [value]);

  return promise;
};

module.exports = Utils;
