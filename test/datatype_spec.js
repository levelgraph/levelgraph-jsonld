// http://json-ld.org/spec/latest/json-ld-api/#data-round-tripping

var level  = require("level-test")()
  , graph  = require("levelgraph")
  , jsonld = require("../");

describe("jsonld.put data type", function() {

  var db, bbb;

  beforeEach(function() {
    db = jsonld(graph(level()));
    bbb = fixture("bigbuckbunny.json");
  });

  describe("coerce", function() {

    it("preserves boolean true", function(done) {
      bbb.isFamilyFriendly = true;
      db.jsonld.put(bbb, function() {
        db.get({
          predicate: "http://schema.org/isFamilyFriendly"
        }, function(err, triples) {
          expect(triples[0].object).to.equal('"true"^^<http://www.w3.org/2001/XMLSchema#boolean>');
          done();
        });
      });
    });

    it("preserves boolean false", function(done) {
      bbb.isFamilyFriendly = false;
      db.jsonld.put(bbb, function() {
        db.get({
          predicate: "http://schema.org/isFamilyFriendly"
        }, function(err, triples) {
          expect(triples[0].object).to.equal('"false"^^<http://www.w3.org/2001/XMLSchema#boolean>');
          done();
        });
      });
    });

    it("preserves integer positive", function(done) {
      bbb.version = 2;
      db.jsonld.put(bbb, function() {
        db.get({
          predicate: "http://schema.org/version"
        }, function(err, triples) {
          expect(triples[0].object).to.equal('"2"^^<http://www.w3.org/2001/XMLSchema#integer>');
          done();
        });
      });
    });

    it("preserves integer negative", function(done) {
      bbb.version = -2;
      db.jsonld.put(bbb, function() {
        db.get({
          predicate: "http://schema.org/version"
        }, function(err, triples) {
          expect(triples[0].object).to.equal('"-2"^^<http://www.w3.org/2001/XMLSchema#integer>');
          done();
        });
      });
    });

    it("preserves integer zero", function(done) {
      bbb.version = 0;
      db.jsonld.put(bbb, function() {
        db.get({
          predicate: "http://schema.org/version"
        }, function(err, triples) {
          expect(triples[0].object).to.equal('"0"^^<http://www.w3.org/2001/XMLSchema#integer>');
          done();
        });
      });
    });

    it("preserves double positive", function(done) {
      bbb.version = 12.345;
      db.jsonld.put(bbb, function() {
        db.get({
          predicate: "http://schema.org/version"
        }, function(err, triples) {
          expect(triples[0].object).to.equal('"1.2345E1"^^<http://www.w3.org/2001/XMLSchema#double>');
          done();
        });
      });
    });

    it("preserves double positive", function(done) {
      bbb.version = -12.345;
      db.jsonld.put(bbb, function() {
        db.get({
          predicate: "http://schema.org/version"
        }, function(err, triples) {
          expect(triples[0].object).to.equal('"-1.2345E1"^^<http://www.w3.org/2001/XMLSchema#double>');
          done();
        });
      });
    });

    it("doesn't preserve string", function(done) {
      bbb.contentRating = "MPAA PG-13";
      db.jsonld.put(bbb, function() {
        db.get({
          predicate: "http://schema.org/contentRating"
        }, function(err, triples) {
          expect(triples[0].object).to.equal("MPAA PG-13");
          done();
        });
      });
    });
  });
});
describe("jsonld.get data type", function() {

  var db, bbb, triple;

  beforeEach(function() {
    db = jsonld(graph(level()));
    bbb = fixture("bigbuckbunny.json");
    triple = {
          subject: bbb["@id"],
          predicate: null,
          object: null
    };
  });

  describe("coerce", function() {

    it("preserves boolean true", function(done) {
      triple.predicate = "http://schema.org/isFamilyFriendly";
      triple.object = '"true"^^<http://www.w3.org/2001/XMLSchema#boolean>';

      db.jsonld.put(bbb, function() {
        db.put(triple, function() {
          db.jsonld.get(bbb["@id"], bbb["@context"], function(err, doc) {
            expect(doc["isFamilyFriendly"]).to.be.true;
            done();
          });
        });
      });
    });

    it("preserves boolean false", function(done) {
      triple.predicate = "http://schema.org/isFamilyFriendly";
      triple.object = '"false"^^<http://www.w3.org/2001/XMLSchema#boolean>';

      db.jsonld.put(bbb, function() {
        db.put(triple, function() {
          db.jsonld.get(bbb["@id"], bbb["@context"], function(err, doc) {
            expect(doc["isFamilyFriendly"]).to.be.false;
            done();
          });
        });
      });
    });

    it("preserves integer positive", function(done) {
      triple.predicate = "http://schema.org/version";
      triple.object = '"2"^^<http://www.w3.org/2001/XMLSchema#integer>';

      db.jsonld.put(bbb, function() {
        db.put(triple, function() {
          db.jsonld.get(bbb["@id"], bbb["@context"], function(err, doc) {
            expect(doc["version"]).to.equal(2);
            done();
          });
        });
      });
    });

    it("preserves integer positive", function(done) {
      triple.predicate = "http://schema.org/version";
      triple.object = '"-2"^^<http://www.w3.org/2001/XMLSchema#integer>';

      db.jsonld.put(bbb, function() {
        db.put(triple, function() {
          db.jsonld.get(bbb["@id"], bbb["@context"], function(err, doc) {
            expect(doc["version"]).to.equal(-2);
            done();
          });
        });
      });
    });

    it("preserves integer zero", function(done) {
      triple.predicate = "http://schema.org/version";
      triple.object = '"0"^^<http://www.w3.org/2001/XMLSchema#integer>';

      db.jsonld.put(bbb, function() {
        db.put(triple, function() {
          db.jsonld.get(bbb["@id"], bbb["@context"], function(err, doc) {
            expect(doc["version"]).to.equal(0);
            done();
          });
        });
      });
    });

    it("preserves double positive", function(done) {
      triple.predicate = "http://schema.org/version";
      triple.object = '"1.2345E1"^^<http://www.w3.org/2001/XMLSchema#double>';

      db.jsonld.put(bbb, function() {
        db.put(triple, function() {
          db.jsonld.get(bbb["@id"], bbb["@context"], function(err, doc) {
            expect(doc["version"]).to.equal(12.345);
            done();
          });
        });
      });
    });

    it("preserves double negative", function(done) {
      triple.predicate = "http://schema.org/version";
      triple.object = '"-1.2345E1"^^<http://www.w3.org/2001/XMLSchema#double>';

      db.jsonld.put(bbb, function() {
        db.put(triple, function() {
          db.jsonld.get(bbb["@id"], bbb["@context"], function(err, doc) {
            expect(doc["version"]).to.equal(-12.345);
            done();
          });
        });
      });
    });

    it("does not preserve string", function(done) {
      triple.predicate = "http://schema.org/contentRating";
      triple.object = '"MPAA PG-13"^^<http://www.w3.org/2001/XMLSchema#string>';

      db.jsonld.put(bbb, function() {
        db.put(triple, function() {
          db.jsonld.get(bbb["@id"], bbb["@context"], function(err, doc) {
            expect(doc["contentRating"]).to.equal("MPAA PG-13");
            done();
          });
        });
      });
    });

  });
});
