var expect = require('chai').expect;
var helper = require('./helper');

describe('jsonld.del', function() {

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
    db.jsonld.put(manu, done);
  });

  it('should del a basic object', function(done) {
    db.jsonld.put(manu, function() {
      db.jsonld.del(manu, function() {
        db.get({}, function(err, triples) {
          // getting the full db
          expect(triples).to.be.empty;
          done();
        });
      });
    });
  });

  it('should del a complex object', function(done) {
    db.jsonld.put(tesla, function() {
      db.jsonld.del(tesla, function() {
        db.get({}, function(err, triples) {
          // getting the full db
          expect(triples).to.be.empty;
          done();
        });
      });
    });
  });

  it('should del a complex object with the preserve option leaving blank nodes', function(done) {
    db.jsonld.put(tesla, function() {
      db.jsonld.del(tesla, { preserve: true }, function() {
        db.get({}, function(err, triples) {
          // blank nodes are left. Consistent with https://www.w3.org/TR/ldpatch/#Delete-statement
          expect(triples).to.have.length(8);
          done();
        });
      });
    });
  });

  it('should del a complex object with the preserve option with no blank nodes completely', function(done) {
    var library = helper.getFixture('library_framed.json');

    db.jsonld.put(library, function() {
      db.jsonld.del(library, { preserve: true }, function() {
        db.get({}, function(err, triples) {
          // blank nodes are left. Consistent with https://www.w3.org/TR/ldpatch/#Delete-statement
          expect(triples).to.have.length(0);
          done();
        });
      });
    });
  });


  it('should del an iri', function(done) {
    db.jsonld.put(manu, function() {
      db.jsonld.del(manu['@id'], function() {
        db.get({}, function(err, triples) {
          // getting the full db
          expect(triples).to.be.empty;
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
            expect(triples).to.have.length(2);
            done();
          });
        });
      });
    });
  });

  it('should del a single object with the preserve option leaving blank nodes', function(done) {
    db.jsonld.put(manu, function() {
      db.jsonld.put(tesla, function() {
        db.jsonld.del(tesla, { preserve: true }, function() {
          db.get({}, function(err, triples) {
            // getting the full db
            expect(triples).to.have.length(10); // 2 triples from Manu and 8 from tesla blanks.
            done();
          });
        });
      });
    });
  });

  it('should del a single object with the preserve option with no blank nodes completely', function(done) {
    var library = helper.getFixture('library_framed.json');

    db.jsonld.put(manu, function() {
      db.jsonld.put(library, function() {
        db.jsonld.del(library, { preserve: true }, function() {
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

    db.jsonld.put(JSON.stringify(jld), {preserve:true}, function() {
      db.jsonld.del(JSON.stringify(jld), {preserve:true}, function(err) {
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
