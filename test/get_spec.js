var level  = require('level-test')(),
    graph  = require('levelgraph'),
    jsonld = require('../'),
    fs     = require('fs');

describe('jsonld.get', function() {

  var db, manu = fixture('manu.json');

  beforeEach(function() {
    db = jsonld(graph(level()), { base: 'http://levelgraph.io/get' } );
  });

  afterEach(function(done) {
    db.close(done);
  });

  it('should get no object', function(done) {
    db.jsonld.get('http://path/to/nowhere', { '@context': manu['@context'] }, function(err, obj) {
      expect(obj).to.be.null;
      done();
    });
  });

  describe('with one object loaded', function() {
    beforeEach(function(done) {
      db.jsonld.put(manu, done);
    });

    it('should load it', function(done) {
      db.jsonld.get(manu['@id'], { '@context': manu['@context'] }, function(err, obj) {
        expect(obj).to.eql(manu);
        done();
      });
    });
  });

  describe('with an object with blank nodes', function() {
    var tesla;

    beforeEach(function(done) {
      tesla = fixture('tesla.json')
      db.jsonld.put(tesla, done);
    });

    it('should load it properly', function(done) {
      db.jsonld.get(tesla['@id'], { '@context': tesla['@context'] }, function(err, obj) {
        tesla['gr:hasPriceSpecification']['@id'] = obj['gr:hasPriceSpecification']['@id'];
        tesla['gr:includes']['@id'] = obj['gr:includes']['@id'];
        expect(obj).to.eql(tesla);
        done();
      });
    });
  });

  it('should support nested objects', function(done) {
    var nested = fixture('nested.json');

    db.jsonld.put(nested, function(err, obj) {
      db.jsonld.get(obj['@id'], { '@context': obj['@context'] }, function(err, result) {
        delete result['knows'][0]['@id'];
        delete result['knows'][1]['@id'];
        expect(result).to.eql(nested);
        done();
      });
    });
  });
});
