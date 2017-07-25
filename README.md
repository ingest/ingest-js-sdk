# Ingest.IO Javascript SDK

[![Build Status](https://travis-ci.org/ingest/ingest-js-sdk.svg?branch=master)](https://travis-ci.org/ingest/ingest-js-sdk) [![Greenkeeper badge](https://badges.greenkeeper.io/ingest/ingest-js-sdk.svg)](https://greenkeeper.io/)

The official Ingest.IO Javascript SDK for interfacing with Ingest.

Getting Started
-------------

Getting started with the Ingest SDK is simple.

The Ingest JS SDK is fully promise based and uses [pinkyswear](https://github.com/timjansen/PinkySwear.js) to handle the promises, removing the need for any polyfills.

There are 2 main ways to utilize it.

### Via NPM

1. Install the SDK via npm:

```sh
npm install @ingest/ingest-js-sdk
```

2. Require it in your project:
```javascript
  var IngestSDK = require('@ingest/ingest-js-sdk');
```

3. Initialize the SDK:
```javascript
  var Ingest = new IngestSDK({
    token: 'Bearer ...'
  });
```

4. Start making calls:
```javascript
  Ingest.videos.getAll()
    .then(function (response) {
      // Handle Response
    });
```

### Via Script

1. Clone the repo
2. Put the `ingest-sdk.js` in a hosted location
3. Include the script tag in your HTML

```html
  <script src="/path/to/hosted/files/ingest-sdk.js"></script>
```

4. Initialize the SDK:

```javascript
  var Ingest = new IngestSDK({
    token: 'Bearer ...'
  });
```

5. Start making calls:
```javascript
  Ingest.videos.getAll()
    .then(function (response) {
      // Handle Response
    });
```

Uploading a file
---------------

Uploading a file is slightly different then using the other resources. To upload a file and start the upload, grab your file and use the `Ingest.upload` functionality:

```javascript
  upload = Ingest.upload(file);
  upload.save();
```

The `Ingest.upload` function returns an upload object, with the following functions available:

Method | Endpoint
-------|---------
abort | `Allows you to abort the upload.`
abortSync | `Allows you to abort the upload synchronously. Takes a callback function to invoke when complete.`
pause | `Pauses the upload.`
progress | `Takes a callback function that is invoked anytime progress on the upload occurs.`
resume | `Resumes a paused upload.`
save | `Starts the upload.`


API Documentation
---------------

For more information on the available functionality of the sdk, please see the [API Docs](https://docs.ingest.io/?javascript#).

Issues
-----

If you encounter any issues using the Ingest JS SDK, please search the existing [issues](https://github.com/ingest/ingest-js-sdk/issues) first before opening a new one.

Please include any information that may be of assistance with reproducing the issue.

Development
---------
To modify the source of the Ingest SDK, clone the repo.

```
npm install
```

Develop in a topic/feature branch, not master.

Running Tests
------------

To run the unit tests, use:

```sh
npm run test
```

To watch the unit tests, use:

```sh
npm run test:watch
```

License
------

This SDK is distributed under the MIT License, see [License](LICENSE) for more information.
