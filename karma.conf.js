var webpackConfig = require('./webpack.config.js');
var path          = require('path');

// Adding in the test-specific loader, on top of the default webpack configuration.
webpackConfig.module.rules.unshift({
  test: /^((?!spec).)*\.js/,
  enforce: 'pre',
  include: path.join(__dirname, 'src/'),
  use: 'istanbul-instrumenter-loader'
});

// Remove es-lint.
webpackConfig.module.rules.splice(1, 1);

module.exports = function (config) {
  config.set({

    // Base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: __dirname,

    // For list of available frameworks, see: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // List of files / patterns to load in the browser.
    files: [
      './tests/index.js'
    ],

    // For list of available reporters, see: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],

    // Hash of patterns to process with the given plugins.
    // Plugin names are assumed to be prefixed with 'karma-'.
    preprocessors: {
      './tests/index.js': ['webpack', 'sourcemap'],
    },

    // Configuration specific to the karma-webpack plugin.
    webpackMiddleware: {
      noInfo: true,
      stats: 'errors-only'
    },

    // Configuration specific to webpack itself.
    webpack: webpackConfig,

    coverageReporter: {
      dir: './coverage',

      /**
       * Function invoked when determining the sub-directory to create.
       *
       * @param {string} browser - The full browser name and version.
       *
       * @example
       * var normalized = subdir('Chrome 59.0.3071 (Mac OS X 10.12.5)');
       * console.log(normalized);  // 'chrome'
       */
      subdir: function (browser) {
        // Normalization process to keep a consistent browser name across different platforms.
        // Ex: 'chrome', 'firefox'.
        return browser.toLowerCase().split(/[ /-]/)[0];
      },
      reporters: [
        { type: 'text-summary' },  // Output a small summary in the terminal once complete.
        { type: 'html' }           // Output a full analysis in HTML format.
      ],
      includeAllSources: true      // Include all files, even if they do not have unit tests.
    },

    browsers: [
      'Chrome'  // Test with the Chrome stable browser. See docs for `karma-chrome-launcher`.
    ]
  });
};
