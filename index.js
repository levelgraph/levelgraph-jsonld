
var jsonld = require("jsonld")
  , uuid   = require("uuid")
  , IRI = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/i;

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

    if (!obj["@id"]) {
      obj["@id"] = options.base + uuid.v1();
    }

    jsonld.expand(obj, options, function(err, expanded) {

      var stream = graphdb.putStream();

      stream.on("error", callback);
      stream.on("close", function() {
        callback(null, obj);
      });

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

  graphdb.jsonld.get = function(iri, context, options, callback) {

    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    graphdb.get({ subject: iri }, function(err, triples) {
      if (err || triples.length === 0) {
        return callback(err, null);
      }

      var triples   = triples.reduce(function(acc, triple) {
                        var key;

                        if (!acc[triple.subject]) {
                          acc[triple.subject] = { "@id": triple.subject };
                        }
                        acc[triple.subject][triple.predicate] = {};
                        key = triple.object.match(IRI) ? "@id" : "@value";
                        acc[triple.subject][triple.predicate][key] = triple.object;

                        return acc;
                      }, {})

        , expanded  = Object.keys(triples).reduce(function(acc, key) {
                        acc.push(triples[key]);
                        return acc;
                      }, []);

      jsonld.compact(expanded, context, options, callback);
    });
  };

  return graphdb;
}

module.exports = levelgraphJSONLD;
