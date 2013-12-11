
var level  = require("level-test")()
  , graph  = require("levelgraph")
  , jsonld = require("../");

describe("jsonld.put", function() {

  var db, manu;

  beforeEach(function() {
    db = jsonld(graph(level()));
    manu = fixture("manu.json");
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
        expect(triples).to.have.length(1);
        done();
      });
    });
  });

  it("should store two triples", function(done) {
    db.jsonld.put(manu, function() {
      db.get({
          subject: "http://manu.sporny.org#person"
      }, function(err, triples) {
        expect(triples).to.have.length(2);
        done();
      });
    });
  });

  it("should store a JSON file", function(done) {
    db.jsonld.put(JSON.stringify(manu), function() {
      db.get({
          subject: "http://manu.sporny.org#person"
      }, function(err, triples) {
        expect(triples).to.have.length(2);
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
        expect(triples).to.have.length(1);
        done();
      });
    });
  });

  it("should generate an @id for unknown objects", function(done) {
    delete manu["@id"];
    var baseString = "http://levelgraph.org/tests/";
    var baseRegEx = /^http:\/\/levelgraph.org\/tests\//;

    db.jsonld.put(manu, { base: baseString }, function() {
      db.join({
          subject: db.v("subject")
        , predicate: "http://xmlns.com/foaf/0.1/name"
        , object: "Manu Sporny"
      }, function(err, contexts) {
        expect(contexts[0].subject).to.match(baseRegEx);
        done();
      });
    });
  });

  it("should pass the generated @id to callback", function(done) {
    delete manu["@id"];
    var baseString = "http://levelgraph.org/tests/";
    var baseRegEx = /^http:\/\/levelgraph.org\/tests\//;

    db.jsonld.put(manu, { base: baseString }, function(err, obj) {
      expect(obj["@id"]).to.match(baseRegEx);
      done();
    });
  });

  it("should convert @type into http://www.w3.org/1999/02/22-rdf-syntax-ns#type", function(done) {
    db.jsonld.put(fixture("tesla.json"), function() {
      db.get({
          subject: "http://example.org/cars/for-sale#tesla"
        , predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
        , object: "http://purl.org/goodrelations/v1#Offering"
      }, function(err, triples) {
        expect(triples).to.have.length(1);
        done();
      });
    });
  });

  it("should update a property", function(done) {
    db.jsonld.put(manu, function(err, instance) {
      instance.homepage = "http://another/website";
      db.jsonld.put(instance, function() {
        db.get({
            subject: "http://manu.sporny.org#person"
          , predicate: "http://xmlns.com/foaf/0.1/homepage"
          , object: "http://another/website"
        }, function(err, triples) {
          expect(triples).to.have.length(1);
          done();
        });
      });
    });
  });

  it("should add a property", function(done) {
    db.jsonld.put(manu, function(err, instance) {
      instance.age = 42;
      instance["@context"].age = "http://xmlns.com/foaf/0.1/age";

      db.jsonld.put(instance, function() {
        db.get({
            subject: "http://manu.sporny.org#person"
          , predicate: "http://xmlns.com/foaf/0.1/age"
          , object: '"42"^^<http://www.w3.org/2001/XMLSchema#integer>'
        }, function(err, triples) {
          expect(triples).to.have.length(1);
          done();
        });
      });
    });
  });

  it("should delete a property", function(done) {
    db.jsonld.put(manu, function(err, instance) {
      delete instance.homepage

      db.jsonld.put(instance, function() {
        db.get({
            subject: "http://manu.sporny.org#person"
          , predicate: "http://xmlns.com/foaf/0.1/homepage"
        }, function(err, triples) {
          expect(triples).to.be.empty;
          done();
        });
      });
    });
  });

  it("should delete a nested object", function(done) {
    db.jsonld.put(fixture("tesla.json"), function(err, instance) {
      delete instance["gr:hasPriceSpecification"];

      db.jsonld.put(instance, function() {
        db.get({
            subject: "http://example.org/cars/for-sale#tesla"
          , predicate: "http://purl.org/goodrelations/v1#"
        }, function(err, triples) {
          expect(triples).to.be.empty;
          done();
        });
      });
    });
  });
});

describe("jsonld.put with default base", function() {

  var db, manu;

  beforeEach(function() {
    db = jsonld(graph(level()), { base: "http://levelgraph.io/ahah/" });
    manu = fixture("manu.json");
  }); 

  afterEach(function(done) {
    db.close(done);
  });

  it("should use it", function(done) {
    manu["@id"] = "42"
    db.jsonld.put(manu, function() {
      db.get({
          subject: "http://levelgraph.io/ahah/42"
        , predicate: "http://xmlns.com/foaf/0.1/name"
        , object: "Manu Sporny"
      }, function(err, triples) {
        expect(triples).to.have.length(1);
        done();
      });
    });
  });

  it("should correctly generate blank nodes as subjects", function(done) {
    var tesla = fixture("tesla.json");

    db.jsonld.put(tesla, function() {
      db.join([{
          subject: "http://example.org/cars/for-sale#tesla"
        , predicate: "http://purl.org/goodrelations/v1#hasPriceSpecification"
        , object: db.v("bnode")
      }, {
          subject: db.v("bnode")
        , predicate: "http://purl.org/goodrelations/v1#hasCurrency"
        , object: "USD"
      }], function(err, contexts) {
        expect(contexts[0].bnode).to.exist;
        done();
      });
    });
  });

  it("should not store undefined objects", function(done) {
    var tesla = fixture("tesla.json");

    db.jsonld.put(tesla, function() {
      db.get({}, function(err, triples) {
        triples.forEach(function(triple) {
          expect(triple.object).to.exist;
        });
        done();
      });
    });
  });

  it("should support nested objects", function(done) {
    var nested = fixture("nested.json");

    db.jsonld.put(nested, function() {
      db.get({}, function(err, triples) {
        expect(triples).to.have.length(5);
        done();
      });
    });
  });
});
