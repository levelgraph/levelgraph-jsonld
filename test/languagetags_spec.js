var level  = require('level-test')(),
    graph  = require('levelgraph'),
    jsonld = require('../');

describe('jsonld.put language tags', function() {

  var db, bbb;

  beforeEach(function() {
    db = jsonld(graph(level()));
    bbb = fixture('bigbuckbunny.json');
  });

  it('default set in context', function(done) {
    bbb['@context']['@language'] = 'en';
    db.jsonld.put(bbb, function() {
      db.get({
        predicate: 'http://schema.org/name'
      }, function(err, triples) {
        expect(triples[0].object).to.equal('"Big Buck Bunny"@en');
        done();
      });
    });
  });

  it('set for term in context', function(done) {
    bbb['@context']['name'] = { '@id': 'http://schema.org/name', '@language': 'en' };
    db.jsonld.put(bbb, function() {
      db.get({
        predicate: 'http://schema.org/name'
      }, function(err, triples) {
        expect(triples[0].object).to.equal('"Big Buck Bunny"@en');
        done();
      });
    });
  });

  it('language map', function(done) {
    bbb['@context']['name'] = { '@id': 'http://schema.org/name', '@container': '@language' };
    bbb.name = { 'en': 'Big Buck Bunny' };
    db.jsonld.put(bbb, function() {
      db.get({
        predicate: 'http://schema.org/name'
      }, function(err, triples) {
        expect(triples[0].object).to.equal('"Big Buck Bunny"@en');
        done();
      });
    });
  });

  it('value object', function(done) {
    bbb.name = { '@language': 'en', '@value': 'Big Buck Bunny' };
    db.jsonld.put(bbb, function() {
      db.get({
        predicate: 'http://schema.org/name'
      }, function(err, triples) {
        expect(triples[0].object).to.equal('"Big Buck Bunny"@en');
        done();
      });
    });
  });

});

describe('jsonld.get language tags', function() {

  var db, bbb, triple;

  beforeEach(function() {
    db = jsonld(graph(level()));
    bbb = fixture('bigbuckbunny.json');
  });

  it('recognizes', function(done) {
    triple = {
          subject: bbb['@id'],
          predicate: 'http://schema.org/name',
          object: '"Big Buck Bunny"@en'
    };

    db.jsonld.put(bbb, function() {
      db.put(triple, function() {
        db.jsonld.get(bbb['@id'], bbb['@context'], function(err, doc) {
          expect(doc['name']['@language']).to.equal('en');
          expect(doc['name']['@value']).to.equal('Big Buck Bunny');
          done();
        });
      });
    });
  });
});
