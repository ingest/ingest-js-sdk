/*eslint no-console:false */
var request = require('request');
var fs = require('fs');
var gulp = require('gulp');

var authServer = 'http://weasley.teamspace.ad:3500/authorize?response_type=token&client_id=IngestLocal&state=xyz&scope=all&redirect_uri=http://local.weasley.teamspace.ad:7070';

// TODO, move sensitive data to ENV vars.
var formData = {
  network: 'redspace',
  login: 'jamie.stackhouse@redspace.com',
  password: 'password'
};

gulp.task('test:generate-auth', function (done) {

  var success = false;

  request.post({
    url: authServer,
    form: formData,
    followRedirect: false
  }, function (error, response, body) {

    if (error) {
      throw new Error(error.stack);
    }

    if (response.statusCode === 302) {

      if (typeof response.headers !== 'undefined' && response.headers.location !== 'undefined') {

        success = true;

        var hashPos = response.headers.location.indexOf("#") + 1;
        var hash = response.headers.location.substring(hashPos);
        var params = hash.split('&');
        var token = params[0].split('=')[1];

        fs.writeFile('authToken.js', 'window.token = "' + token + '";', function (error) {

          if (error) {
            throw new Error(error.stack);
          }

        });

      }

    }

    if (!success) {
      throw new Error('There was an error while trying to generate an auth token.')
    }

  });

});
