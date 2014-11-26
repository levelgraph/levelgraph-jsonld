// http://json-ld.org/spec/latest/json-ld-api/#data-round-tripping
var expect = require('chai').expect;
var helper = require('./helper');

describe('jsonld.put data type', function() {

  var db, bbb;

  beforeEach(function() {
    db = helper.getDB();
    bbb = helper.getFixture('bigbuckbunny.json');
  });

  describe('coerce', function() {

    it('preserves boolean true', function(done) {
      bbb.isFamilyFriendly = true;
      db.jsonld.put(bbb, function() {
        db.get({
          predicate: 'http://schema.org/isFamilyFriendly'
        }, function(err, triples) {
          expect(triples[0].object).to.equal('"true"^^http://www.w3.org/2001/XMLSchema#boolean');
          done();
        });
      });
    });

    it('preserves boolean false', function(done) {
      bbb.isFamilyFriendly = false;
      db.jsonld.put(bbb, function() {
        db.get({
          predicate: 'http://schema.org/isFamilyFriendly'
        }, function(err, triples) {
          expect(triples[0].object).to.equal('"false"^^http://www.w3.org/2001/XMLSchema#boolean');
          done();
        });
      });
    });

    it('preserves integer positive', function(done) {
      bbb.version = 2;
      db.jsonld.put(bbb, function() {
        db.get({
          predicate: 'http://schema.org/version'
        }, function(err, triples) {
          expect(triples[0].object).to.equal('"2"^^http://www.w3.org/2001/XMLSchema#integer');
          done();
        });
      });
    });

    it('preserves integer negative', function(done) {
      bbb.version = -2;
      db.jsonld.put(bbb, function() {
        db.get({
          predicate: 'http://schema.org/version'
        }, function(err, triples) {
          expect(triples[0].object).to.equal('"-2"^^http://www.w3.org/2001/XMLSchema#integer');
          done();
        });
      });
    });

    it('preserves integer zero', function(done) {
      bbb.version = 0;
      db.jsonld.put(bbb, function() {
        db.get({
          predicate: 'http://schema.org/version'
        }, function(err, triples) {
          expect(triples[0].object).to.equal('"0"^^http://www.w3.org/2001/XMLSchema#integer');
          done();
        });
      });
    });

    it('preserves double positive', function(done) {
      bbb.version = 12.345;
      db.jsonld.put(bbb, function() {
        db.get({
          predicate: 'http://schema.org/version'
        }, function(err, triples) {
          expect(triples[0].object).to.equal('"1.2345E1"^^http://www.w3.org/2001/XMLSchema#double');
          done();
        });
      });
    });

    it('preserves double negative', function(done) {
      bbb.version = -12.345;
      db.jsonld.put(bbb, function() {
        db.get({
          predicate: 'http://schema.org/version'
        }, function(err, triples) {
          expect(triples[0].object).to.equal('"-1.2345E1"^^http://www.w3.org/2001/XMLSchema#double');
          done();
        });
      });
    });

    it('does not preserve string', function(done) {
      bbb.contentRating = 'MPAA PG-13';
      db.jsonld.put(bbb, function() {
        db.get({
          predicate: 'http://schema.org/contentRating'
        }, function(err, triples) {
          expect(triples[0].object).to.equal('"MPAA PG-13"');
          done();
        });
      });
    });

    it('does preserve date type when defined in context', function(done) {
      var example = {
        "@context": {
          "@vocab": "http://schema.org/",
          "startTime": { "@type": "http://www.w3.org/2001/XMLSchema#dateTime" }
        },
        "@id": "http://example.net/random-thing",
        "@type": "Action",
        "startTime": "2014-01-28T12:27:54"
      };
      db.jsonld.put(example, function() {
        db.get({
          predicate: 'http://schema.org/startTime'
        }, function(err, triples) {
          expect(triples[0].object).to.equal('"2014-01-28T12:27:54"^^http://www.w3.org/2001/XMLSchema#dateTime');
          done();
        });

      });
    });

    it('does preserve date type when defined for given object', function(done) {
      var example = {
        "@context": {
          "@vocab": "http://schema.org/"
        },
        "@id": "http://example.net/random-thing",
        "@type": "Action",
        "startTime": {
          "@value": "2014-01-28T12:27:54",
          "@type": "http://www.w3.org/2001/XMLSchema#dateTime"
        }
      };
      db.jsonld.put(example, function() {
        db.get({
          predicate: 'http://schema.org/startTime'
        }, function(err, triples) {
          expect(triples[0].object).to.equal('"2014-01-28T12:27:54"^^http://www.w3.org/2001/XMLSchema#dateTime');
          done();
        });

      });
    });
  });
});
describe('jsonld.get data type', function() {

  var db, bbb, triple;

  beforeEach(function() {
    db = helper.getDB();
    bbb = helper.getFixture('bigbuckbunny.json');
    triple = {
          subject: bbb['@id'],
          predicate: null,
          object: null
    };
  });

  describe('coerce', function() {

    it('preserves boolean true', function(done) {
      triple.predicate = 'http://schema.org/isFamilyFriendly';
      triple.object = '"true"^^http://www.w3.org/2001/XMLSchema#boolean';

      db.jsonld.put(bbb, function() {
        db.put(triple, function() {
          db.jsonld.get(bbb['@id'], bbb['@context'], function(err, doc) {
            expect(doc['isFamilyFriendly']).to.be.true;
            done();
          });
        });
      });
    });

    it('preserves boolean false', function(done) {
      triple.predicate = 'http://schema.org/isFamilyFriendly';
      triple.object = '"false"^^http://www.w3.org/2001/XMLSchema#boolean';

      db.jsonld.put(bbb, function() {
        db.put(triple, function() {
          db.jsonld.get(bbb['@id'], bbb['@context'], function(err, doc) {
            expect(doc['isFamilyFriendly']).to.be.false;
            done();
          });
        });
      });
    });

    it('preserves integer positive', function(done) {
      triple.predicate = 'http://schema.org/version';
      triple.object = '"2"^^http://www.w3.org/2001/XMLSchema#integer';

      db.jsonld.put(bbb, function() {
        db.put(triple, function() {
          db.jsonld.get(bbb['@id'], bbb['@context'], function(err, doc) {
            expect(doc['version']).to.equal(2);
            done();
          });
        });
      });
    });

    it('preserves integer negative', function(done) {
      triple.predicate = 'http://schema.org/version';
      triple.object = '"-2"^^http://www.w3.org/2001/XMLSchema#integer';

      db.jsonld.put(bbb, function() {
        db.put(triple, function() {
          db.jsonld.get(bbb['@id'], bbb['@context'], function(err, doc) {
            expect(doc['version']).to.equal(-2);
            done();
          });
        });
      });
    });

    it('preserves integer zero', function(done) {
      triple.predicate = 'http://schema.org/version';
      triple.object = '"0"^^http://www.w3.org/2001/XMLSchema#integer';

      db.jsonld.put(bbb, function() {
        db.put(triple, function() {
          db.jsonld.get(bbb['@id'], bbb['@context'], function(err, doc) {
            expect(doc['version']).to.equal(0);
            done();
          });
        });
      });
    });

    it('preserves double positive', function(done) {
      triple.predicate = 'http://schema.org/version';
      triple.object = '"1.2345E1"^^http://www.w3.org/2001/XMLSchema#double';

      db.jsonld.put(bbb, function() {
        db.put(triple, function() {
          db.jsonld.get(bbb['@id'], bbb['@context'], function(err, doc) {
            expect(doc['version']).to.equal(12.345);
            done();
          });
        });
      });
    });

    it('preserves double negative', function(done) {
      triple.predicate = 'http://schema.org/version';
      triple.object = '"-1.2345E1"^^http://www.w3.org/2001/XMLSchema#double';

      db.jsonld.put(bbb, function() {
        db.put(triple, function() {
          db.jsonld.get(bbb['@id'], bbb['@context'], function(err, doc) {
            expect(doc['version']).to.equal(-12.345);
            done();
          });
        });
      });
    });

    it('does not preserve string', function(done) {
      triple.predicate = 'http://schema.org/contentRating';
      triple.object = '"MPAA PG-13"^^http://www.w3.org/2001/XMLSchema#string';

      db.jsonld.put(bbb, function() {
        db.put(triple, function() {
          db.jsonld.get(bbb['@id'], bbb['@context'], function(err, doc) {
            expect(doc['contentRating']).to.equal('MPAA PG-13');
            done();
          });
        });
      });
    });

    it('does preserve date', function(done) {
      var example = {
        "@context": {
          "@vocab": "http://schema.org/",
        },
        "@id": "http://example.net/random-thing",
        "@type": "Action"
      };
      var triple = {
        subject: example['@id'],
        predicate: 'http://schema.org/startTime',
        object: '"2014-01-28T12:27:54"^^http://www.w3.org/2001/XMLSchema#dateTime'
      };
      db.jsonld.put(example, function() {
        db.put(triple, function() {
          db.jsonld.get(example['@id'], example['@context'], function(err, doc) {
            expect(doc['startTime']['@type']).to.equal('http://www.w3.org/2001/XMLSchema#dateTime');
            done();
          });
        });
      });
    });

    //https://github.com/digitalbazaar/jsonld.js/issues/49#issuecomment-31614358
    it('compacts term if value matches type', function(done) {
      var example = {
        "@context": {
          "@vocab": "http://schema.org/",
          "startTime": { "@type": "http://www.w3.org/2001/XMLSchema#dateTime" }
        },
        "@id": "http://example.net/random-thing",
        "@type": "Action"
      };
      var triple = {
        subject: example['@id'],
        predicate: 'http://schema.org/startTime',
        object: '"2014-01-28T12:27:54"^^http://www.w3.org/2001/XMLSchema#dateTime'
      };
      db.jsonld.put(example, function() {
        db.put(triple, function() {
          db.jsonld.get(example['@id'], example['@context'], function(err, doc) {
            expect(doc['startTime']).to.equal('2014-01-28T12:27:54');
            done();
          });
        });
      });
    });

    //https://github.com/digitalbazaar/jsonld.js/issues/49#issuecomment-31614358
    it('does not compact term when value does not have explicit type', function(done) {
      var example = {
        "@context": {
          "@vocab": "http://schema.org/",
          "startTime": { "@type": "http://www.w3.org/2001/XMLSchema#dateTime" }
        },
        "@id": "http://example.net/random-thing",
        "@type": "Action"
      };
      var triple = {
        subject: example['@id'],
        predicate: 'http://schema.org/startTime',
        object: '"2014-01-28T12:27:54"'
      };
      db.jsonld.put(example, function() {
        db.put(triple, function() {
          db.jsonld.get(example['@id'], example['@context'], function(err, doc) {
            expect(doc['http://schema.org/startTime']).to.equal('2014-01-28T12:27:54');
            done();
          });
        });
      });
    });

  });
});
