var expect = require('chai').expect;
var helper = require('./helper');

describe('db.search', function() {

  var db, gang, manu;

  beforeEach(function() {
    db = helper.getDB();
    manu = helper.getFixture('manu.json');
    manu['@context']['knows'] = { "@type": "@id" };
    manu['@context']['based_near'] = { "@type": "@id" };
    manu['knows'] = [
    {
      "@id": "https://my-profile.eu/people/deiu/card#me",
      "name": "Andrei Vlad Sambra",
      "based_near": "http://dbpedia.org/resource/Paris"
    }, {
      "@id": "http://melvincarvalho.com/#me",
      "name": "Melvin Carvalho",
      "based_near": "http://dbpedia.org/resource/Honolulu"
    }, {
      "@id": "http://bblfish.net/people/henry/card#me",
      "name": "Henry Story",
      "based_near": "http://dbpedia.org/resource/Paris"
    }, {
      "@id": "http://presbrey.mit.edu/foaf#presbrey",
      "name": "Joe Presbrey",
      "based_near": "http://dbpedia.org/resource/Cambridge"
    }
    ];
  });

  afterEach(function(done) {
    db.close(done);
  });

  it('should find homies in Paris', function(done) {
    var paris = 'http://dbpedia.org/resource/Paris';
    var parisians = [{
      webid: 'http://bblfish.net/people/henry/card#me',
      name: '"Henry Story"'
    }, {
      webid: 'https://my-profile.eu/people/deiu/card#me',
      name: '"Andrei Vlad Sambra"'
    }];

    db.jsonld.put(manu, function(){
      db.search([{
        subject: manu['@id'],
        predicate: 'http://xmlns.com/foaf/0.1/knows',
        object: db.v('webid')
      }, {
        subject: db.v('webid'),
        predicate: 'http://xmlns.com/foaf/0.1/based_near',
        object: paris
      }, {
        subject: db.v('webid'),
        predicate: 'http://xmlns.com/foaf/0.1/name',
        object: db.v('name')
      }], function(err, solution) {
        expect(solution).to.eql(parisians);
        done();
      });
    });
  });

});
