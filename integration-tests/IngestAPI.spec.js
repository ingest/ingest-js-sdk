var api;

describe('Ingest API', function() {

  // Note : Jasmine uses beforeAll for this case.
  beforeAll(function() {
    // Create a new instance of the API for testing.
    api = new IngestAPI();
  });

  it('Should exist on the window object', function() {
    expect(api).toBeDefined();
  });

  it('Should have an init function that returns its name', function() {
    expect(api.init).toBeDefined();

    expect(api.init()).toEqual('IngestAPI');

  });

});
