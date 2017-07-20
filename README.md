# Ingest.IO Javascript SDK

The official Ingest.IO Javascript SDK for interfacing with Ingest.

Getting Started
-------------

Getting started with the Ingest SDK is simple.

The Ingest JS SDK is fully promise based and uses [pinkyswear](https://github.com/timjansen/PinkySwear.js) to handle the promises, removing the need for any polyfills.

There are 2 main ways to utilize it.

### Via NPM

1. Install the SDK via npm:

```sh
npm install ingest-js-sdk
```

2. Require it in your project:
```javascript
  var IngestSDK = require('ingest-js-sdk');
```

3. Initialize the SDK:
```javascript
  var sdk = new IngestSDK({
    token: 'Bearer ...'
  });
```

4. Start making calls:
```javascript
  sdk.videos.getAll()
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
  var sdk = new IngestSDK({
    token: 'Bearer ...'
  });
```

5. Start making calls:
```javascript
  sdk.videos.getAll()
    .then(function (response) {
      // Handle Response
    });
```

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
