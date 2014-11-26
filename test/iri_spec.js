var expect = require('chai').expect;
var helper = require('./helper'),
    _ = require('lodash');

describe('IRI', function() {

  var db, manu;

  beforeEach(function() {
    db = helper.getDB({ jsonld: { base: 'http://levelgraph.io/get' } });
    manu = helper.getFixture('manu.json');
  });

  afterEach(function(done) {
    db.close(done);
  });

  it('keeps literals as literals', function(done) {
    var literal = 'http://dbpedia.org/resource/Honolulu';
    manu['based_near'] = literal;

    db.jsonld.put(manu, function(){
      db.jsonld.get(manu['@id'], { '@context': manu['@context'] }, function(err, obj) {
        expect(obj['based_near']).to.eql(literal);
        done();
      });
    });
  });

  it('keeps @id as IRI', function(done) {
    var id = { '@id': 'http://dbpedia.org/resource/Honolulu' };
    manu['based_near'] = id;

    db.jsonld.put(manu, function(){
      db.jsonld.get(manu['@id'], { '@context': manu['@context'] }, function(err, obj) {
        expect(obj['based_near']).to.eql(id);
        done();
      });
    });
  });

  it('keeps literal as IRI if defined as @id through @context', function(done) {
    var literal = 'http://dbpedia.org/resource/Honolulu';
    manu['based_near'] = literal;

    var oldContext = _.cloneDeep(manu['@context']);
    manu['@context']['based_near'] = { '@type': '@id' };

    var id = { '@id': 'http://dbpedia.org/resource/Honolulu' };

    db.jsonld.put(manu, function(){
      db.jsonld.get(manu['@id'], { '@context': oldContext }, function(err, obj) {
        expect(obj['based_near']).to.eql(id);
        done();
      });
    });
  });

  it('keeps @id as IRI not only for http: scheme', function(done) {
    manu['@id'] = 'mailto:msporny@digitalbazar.com';

    db.jsonld.put(manu, function(){
      db.jsonld.get(manu['@id'], { '@context': manu['@context'] }, function(err, obj) {
        expect(manu).to.eql(manu);
        done();
      });
    });
  });
});
