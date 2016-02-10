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

/**
 * Wrap an array of promises and return when they have all completed.
 * @param   {Array}     promises  An array of promises to manage.
 * @param   {boolean}   paused    A boolean to pause the execution of the promises.
 * @return  {Promise}             A promise that is resolved when all of the promises have fulfilled.
 */
Utils.series = function (promises, paused) {

  var promisesCount = promises.length;
  var all = Promise();

  var state = {
    total: promisesCount,
    complete: 0,
    responses: [],
    promises: promises,
    paused: true
  };

  all.pause = Utils._seriesPause.bind(undefined, all, state);
  all.resume = Utils._seriesResume.bind(undefined, all, state);

  if (!paused) {
    state.paused = false;
    Utils._seriesCallPromise(promises[0], state, all);
  }

  return all;

};

/**
 * Call a promise and pass the complete and error functions.
 * @param  {Promise} promise Promise to execute on.
 * @param  {Object} state   Persistent state of the series of promises.
 */
Utils._seriesCallPromise = function (promise, state, all) {
  // call the promise;
  if (!state.paused) {
    promise().then(Utils._seriesComplete.bind(undefined, all, state),
      Utils._seriesError.bind(undefined, all, state));
  }
};

/**
 * Manage the progress of the promises.
 * @private
 * @param  {Promise} all      All promise.
 * @param  {Object}  state    State object used to persist the promise count.
 * @param  {Object}  response Response of the promise being fulfilled.
 */
Utils._seriesComplete = function (all, state, response) {

  // Increment the complete promises.
  state.complete++;
  state.responses.push(response);

  if (state.complete >= state.total) {
    all(true, state.responses);
  } else {
    if (!state.paused) {
      // Execute the next promise.
      Utils._seriesCallPromise(state.promises[state.complete], state, all);
    }
  }

};

/**
 * Immediately reject the promise if there is an error.
 * @param  {Promise} all  All promise.
 * @param  {Object}  state    State object used to persist the promise count.
 * @param  {Object}  response Response of the promise being fulfilled.
 */
Utils._seriesError = function (all, state, error) {
  all(false, [error]);
};

/**
 * Pause the current series of promises.
 * @param  {Promise} all  All promise.
 * @param  {Object}  state    State object used to persist the promise count.
 */
Utils._seriesPause = function (all, state) {
  state.paused = true;
};

/**
 * Resume the current series of promises.
 * @param  {Promise} all  All promise.
 * @param  {Object}  state    State object used to persist the promise count.
 */
Utils._seriesResume = function (all, state) {
  state.paused = false;

  if (state.complete !== state.total) {
    Utils._seriesCallPromise(state.promises[state.complete], state, all);
  }
};

module.exports = Utils;