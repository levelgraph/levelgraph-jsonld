var expect = require('chai').expect;
var helper = require('./helper');

describe('jsonld.cut', function() {

  var db, manu, tesla;

  beforeEach(function() {
    db = helper.getDB({ jsonld: { base: 'http://levelgraph.io/' } });
    manu = helper.getFixture('manu.json');
    tesla = helper.getFixture('tesla.json');
  });

  afterEach(function(done) {
    db.close(done);
  });

  it('should accept a done callback', function(done) {
    db.jsonld.cut(manu, done);
  });

  it('should cut a basic object', function(done) {
    db.jsonld.put(manu, function() {
      db.jsonld.cut(manu, function() {
        db.get({}, function(err, triples) {
          // getting the full db
          expect(triples).to.be.empty;
          done();
        });
      });
    });
  });

  it('should cut nothing', function(done) {
    db.jsonld.put(manu, function() {
      db.jsonld.cut({}, function() {
        db.get({}, function(err, triples) {
          // getting the full db
          expect(triples).to.have.length(2);
          done();
        });
      });
    });
  });

  it('should cut a complex object', function(done) {
    db.jsonld.put(tesla, function() {
      db.jsonld.cut(tesla, function() {
        db.get({}, function(err, triples) {
          // getting the full db
          expect(triples).to.have.length(0);
          done();
        });
      });
    });
  });

  it('should del an iri with the cut option', function(done) {
    db.jsonld.put(manu, function() {
      db.jsonld.del(manu['@id'], function(err) {
        expect(err && err.message).to.equal("Passing an IRI to del is not supported anymore. Please pass a JSON-LD document.")
        db.get({}, function(err, triples) {
          // getting the full db
          expect(triples).to.have.length(2);
          done();
        });
      });
    });
  });


  it('should del a single object leaving blank nodes', function(done) {
    db.jsonld.put(manu, function() {
      db.jsonld.put(tesla, function() {
        db.jsonld.del(tesla, function() {
          db.get({}, function(err, triples) {
            // getting the full db
            expect(triples).to.have.length(10); // 2 triples from Manu and 8 from tesla blanks.
            done();
          });
        });
      });
    });
  });

  it('should del a single object with the cut option leaving blank nodes', function(done) {
    // This should also be deprecated in favor of using a `cut` option or the `cut` function.
    db.jsonld.put(manu, function() {
      db.jsonld.put(tesla, function() {
        db.jsonld.del(tesla, {cut: true}, function() {
          db.get({}, function(err, triples) {
            // getting the full db
            expect(triples).to.have.length(2); // 2 triples from Manu.
            done();
          });
        });
      });
    });
  });

  it('should del a single object with no blank nodes completely', function(done) {
    var library = helper.getFixture('library_framed.json');

    db.jsonld.put(manu, function() {
      db.jsonld.put(library, function() {
        db.jsonld.del(library, function() {
          db.get({}, function(err, triples) {
            // getting the full db
            expect(triples).to.have.length(2);
            done();
          });
        });
      });
    });
  });

  it('should del obj passed as stringified JSON', function(done) {
    var jld = {"@context": { "@vocab": "https://schema.org/"}, "name": "BigBlueHat"};

    db.jsonld.put(JSON.stringify(jld), function() {
      db.jsonld.del(JSON.stringify(jld), function(err) {
        expect(err).to.not.exist;
        db.get({}, function(err, triples) {
          // getting the full db
          expect(triples).to.have.length(1);
          done();
        });
      });
    });
  });
});
