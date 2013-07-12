
var level = require("level-test")()
  , graph = require("levelgraph")
  , jsonld = require("../")

describe("jsonld.get", function() {
  
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
      };

  beforeEach(function() {
    db = jsonld(graph(level()));
  });

  afterEach(function(done) {
    db.close(done);
  });

  it("should get no object", function(done) {
    db.jsonld.get("http://path/to/nowhere", { "@context": manu["@context"] }, function(err, obj) {
      expect(obj).to.be.null;
      done();
    });
  });

  describe("with one object loaded", function() {
    beforeEach(function(done) {
      db.jsonld.put(manu, done);
    });

    it("should load it", function(done) {
      db.jsonld.get(manu["@id"], { "@context": manu["@context"] }, function(err, obj) {
        expect(obj).to.be.eql(manu);
        done();
      });
    });
  });
});
