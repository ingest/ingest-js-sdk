// Generally follows this: https://github.com/webpack-contrib/istanbul-instrumenter-loader#testindexjs

// We can use the the context method on "require" that webpack created in order to tell webpack
// what files we actually want to require or import.
// Below, context will be a function/object with file names as keys.
// using that regex we are saying look in client/app and find
// any file that ends with spec.js and get its path. By passing in true
// we say do this recursively.
var context = require.context('./', true, /\.spec\.js/);

// Get all the files (keys), and then for each file, call the context function
// that will require the file and load it up here. Context will
// loop and require those spec files here.
context.keys().forEach(context);
