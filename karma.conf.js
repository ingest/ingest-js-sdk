module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: __dirname,

    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      './dist/ingest.js',
      './integration-tests/**/*.spec.js'
    ],

    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec', 'coverage'],

    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      './dist/ingest.js': ['sourcemap', 'coverage'],
    },

    coverageReporter: {
      dir: './dist/integration-coverage',
      reporters: [
        {
          type: 'html',
          subdir: '.'
        }
      ]
    },

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

  });
};
