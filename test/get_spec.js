var helper = require('./helper');

describe('jsonld.get', function() {

  var db, manu;

  beforeEach(function() {
    manu = helper.getFixture('manu.json');
    db = helper.getDB({ jsonld: { base: 'http://levelgraph.io/get' } });
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
      tesla = helper.getFixture('tesla.json');
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
    var nested = helper.getFixture('nested.json');

    db.jsonld.put(nested, function(err, obj) {
      db.jsonld.get(obj['@id'], { '@context': obj['@context'] }, function(err, result) {
        delete result['knows'][0]['@id'];
        delete result['knows'][1]['@id'];
        expect(result).to.eql(nested);
        done();
      });
    });
  });

  describe('with an object with an array for its ["@type"]', function() {
    var ratatat;

    beforeEach(function(done) {
      ratatat = helper.getFixture('ratatat.json');
      db.jsonld.put(ratatat, done);
    });

    it('should retrieve the object', function(done) {
      db.jsonld.get(ratatat['@id'], {}, function(err, obj) {
        expect(obj['@type']).to.have.members(ratatat['@type']);
        expect(obj['@id']).to.eql(ratatat['@id']);
        done();
      });
    });
  });
});
