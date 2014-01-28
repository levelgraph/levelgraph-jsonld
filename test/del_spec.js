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

  it('should del a single object', function(done) {
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
});
