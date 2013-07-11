
var level = require("level-test")()
  , graph = require("levelgraph")
  , jsonld = require("../")

describe("jsonld.put", function() {
  
  var db
    , manu = {
          "@context": {
              "name": "http://xmlns.com/foaf/0.1/name"
            , "homepage": {
                  "@id": "http://xmlns.com/foaf/0.1/homepage"
                , "@type": "@id"
              }
          }
        , "@id": "http://manu.sporny.org#person"
        , "name": "Manu Sporny"
        , "homepage": "http://manu.sporny.org/"
      }


  beforeEach(function() {
    db = jsonld(graph(level()));
  }); 

  afterEach(function(done) {
    db.close(done);
  });

  it("should accept a done callback", function(done) {
    db.jsonld.put(manu, done);
  });

  it("should store a triple", function(done) {
    db.jsonld.put(manu, function() {
      db.get({
          subject: "http://manu.sporny.org#person"
        , predicate: "http://xmlns.com/foaf/0.1/name"
        , object: "Manu Sporny"
      }, function(err, triples) {
        expect(triples).to.have.property("length", 1);
        done();
      });
    });
  });

  it("should store two triples", function(done) {
    db.jsonld.put(manu, function() {
      db.get({
          subject: "http://manu.sporny.org#person"
      }, function(err, triples) {
        expect(triples).to.have.property("length", 2);
        done();
      });
    });
  });

  it("should store a JSON file", function(done) {
    db.jsonld.put(JSON.stringify(manu), function() {
      db.get({
          subject: "http://manu.sporny.org#person"
      }, function(err, triples) {
        expect(triples).to.have.property("length", 2);
        done();
      });
    });
  });

  it("should support a base IRI", function(done) {
    manu["@id"] = "42"
    db.jsonld.put(manu, { base: "http://levelgraph.org/tests/" }, function() {
      db.get({
          subject: "http://levelgraph.org/tests/42"
        , predicate: "http://xmlns.com/foaf/0.1/name"
        , object: "Manu Sporny"
      }, function(err, triples) {
        expect(triples).to.have.property("length", 1);
        done();
      });
    });
  });

  it("should generate a uuid for unknown objects", function(done) {
    delete manu["@id"];

    db.jsonld.put(manu, { base: "http://levelgraph.org/tests/" }, function() {
      db.join({
          subject: db.v("subject")
        , predicate: "http://xmlns.com/foaf/0.1/name"
        , object: "Manu Sporny"
      }, function(err, contexts) {
        expect(contexts[0].subject.indexOf("http://levelgraph.org/tests/")).to.equal(0);
        done();
      });
    });
  });
});
