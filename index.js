
var jsonld = require("jsonld")
  , uuid   = require("uuid");

function levelgraphJSONLD(db) {
  
  if (db.jsonld) {
    return db;
  }

  var graphdb = Object.create(db);

  graphdb.jsonld = {};

  graphdb.jsonld.put = function(obj, options, callback) {
    if (typeof obj === 'string') {
      obj = JSON.parse(obj);
    }

    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    options.base = options.base || "";

    jsonld.expand(obj, options, function(err, expanded) {

      var stream = graphdb.putStream();

      stream.on("error", callback);
      stream.on("close", callback);

      expanded.forEach(function(triples) {
        var subject = triples["@id"];
        delete triples["@id"];

        if (!subject) {
          subject = options.base + uuid.v1();
        }

        Object.keys(triples).forEach(function(predicate) {
          triples[predicate].forEach(function(object) {
            var triple = {
                subject: subject
              , predicate: predicate
              , object: object["@id"] || object["@value"]
            };
            stream.write(triple);
          });
        });
      });

      stream.end();
    });
  };

  return graphdb;
}

module.exports = levelgraphJSONLD;
