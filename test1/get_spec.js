var expect = require('chai').expect;
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
    var tesla, annotation;

    beforeEach(function(done) {
      tesla = helper.getFixture('tesla.json');
      annotation = helper.getFixture('annotation.json');
      done();
    });

    it('should load it properly', function(done) {
      db.jsonld.put(tesla, function() {
        db.jsonld.get(tesla['@id'], { '@context': tesla['@context'] }, function(err, obj) {
          expect(obj).to.eql(tesla);
          done();
        });
      });
    });

    it('should load a context with mapped ids', function(done) {
      db.jsonld.put(annotation, function() {
        db.jsonld.get(annotation['id'], { '@context': annotation['@context'] }, function(err, obj) {
          expect(obj['body']).to.deep.have.members(annotation['body']);
          expect(obj['target']).to.deep.have.members(annotation['target']);
          done();
        });
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

  it('with an object with multiple objects for same predicate' ,function(done){
    var bbb = helper.getFixture('bigbuckbunny.json');

    var act1 = {
          subject: bbb['@id'],
          predicate: 'http://schema.org/actor',
          object: 'http://example.net/act1'
    };

    var act2 = {
          subject: bbb['@id'],
          predicate: 'http://schema.org/actor',
          object: 'http://example.net/act2'
    };

    db.jsonld.put(bbb, function() {
      db.put([act1, act2], function() {
        db.jsonld.get(bbb['@id'], bbb['@context'], function(err, doc) {
          expect(doc['actor']).to.be.an('array');
          expect(doc['actor']).to.have.length(2);
          done();
        });
      });
    });
  });

  describe('with an object with lists', function() {
    var listdoc, listcontext;

    beforeEach(function(done) {
      listdoc = helper.getFixture('list.json');
      listcontext = helper.getFixture('listcontext.json');
      done();
    });

    it('should load it properly', function(done) {
      db.jsonld.put(listdoc, function() {
        db.jsonld.get(listdoc['@id'], {}, function(err, obj) {
          expect(obj).to.eql(listdoc);
          done();
        });
      });
    });

    it('should load with a context with list containers', function(done) {
      db.jsonld.put(listcontext, function() {
        db.jsonld.get(listcontext['@id'], { '@context': listcontext['@context'] }, function(err, obj) {
          expect(obj).to.eql(listcontext);
          done();
        });
      });
    });
  });

  it('should reconstitute a list into an array', function(done) {
    var listdoc = helper.getFixture('list.json');

    db.jsonld.put(listdoc, function(err, obj) {
      db.jsonld.get(obj['@id'], {}, function (err, loaded) {
        expect(loaded['https://example.org/list']['@list']).to.have.length(2)
        expect(loaded['https://example.org/list']['@list'][0]['https://example.org/item']).to.equal("one")
        expect(loaded['https://example.org/list']['@list'][1]['https://example.org/item']).to.equal("two")
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
