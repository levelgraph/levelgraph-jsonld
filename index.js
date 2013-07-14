
var jsonld = require("jsonld")
  , uuid   = require("uuid")
  , IRI = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/i
  , RDFTYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
  , async = require("async");

function levelgraphJSONLD(db, jsonldOpts) {
  
  if (db.jsonld) {
    return db;
  }

  var graphdb = Object.create(db);

  jsonldOpts = jsonldOpts || {};
  jsonldOpts.base = jsonldOpts.base || "";

  graphdb.jsonld = {
      options: jsonldOpts
  };

  graphdb.jsonld.put = function(obj, options, callback) {
    if (typeof obj === 'string') {
      obj = JSON.parse(obj);
    }

    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    options.base = options.base || this.options.base;

    if (!obj["@id"]) {
      obj["@id"] = options.base + uuid.v1();
    }

    jsonld.expand(obj, options, function(err, expanded) {

      var stream = graphdb.putStream();

      stream.on("error", callback);
      stream.on("close", function() {
        callback(null, obj);
      });

      var writeTriples = function(triples) {
        var subject = triples["@id"];
        delete triples["@id"];

        if (!subject) {
          subject = "_:" + uuid.v1();
        }

        Object.keys(triples).forEach(function(predicate) {
          if (predicate === "@type") {
            if (!triples[predicate].forEach) {
              triples[predicate] = [triples[predicate]];
            }

            triples[RDFTYPE] = triples[predicate];
            delete triples[predicate];
            predicate = RDFTYPE;
          }

          triples[predicate].forEach(function(object) {
            var triple = {
                subject: subject
              , predicate: predicate
              , object: (typeof object === 'string') ? object : object["@id"] || object["@value"]
            };
            
            if (!triple.object) {
              // the object should be a blank node that points
              // to a another triple
              writeTriples(object);
              triple.object = object["@id"];
            }

            stream.write(triple);
          });
        });

        triples["@id"] = subject;
      };

      expanded.forEach(writeTriples);

      stream.end();
    });
  };

  var fetchExpandedTriples = function(iri, memo, callback) {
    if (typeof memo === "function") {
      callback = memo;
      memo = {};
    }

    graphdb.get({ subject: iri }, function(err, triples) {
      if (err || triples.length === 0) {
        return callback(err, null);
      }

      async.reduce(triples, memo, function(acc, triple, cb) {
        var key;

        if (!acc[triple.subject]) {
          acc[triple.subject] = { "@id": triple.subject };
        }
        
        if (triple.predicate === RDFTYPE) {
          if (acc[triple.subject]["@type"]) {
            acc[triple.subject]["@type"] = [acc[triple.subject]["@type"]];
            acc[triple.subject]["@type"].push(triple.object);
          } else {
            acc[triple.subject]["@type"] = triple.object;
          }
          cb(null, acc);
        } else if (triple.object.indexOf("_:") !== 0) {
          acc[triple.subject][triple.predicate] = {};
          key = (triple.object.match(IRI) || triple.object.indexOf("_:") === 0) ? "@id" : "@value";
          acc[triple.subject][triple.predicate][key] = triple.object;
          cb(null, acc);
        } else {
          fetchExpandedTriples(triple.object, function(err, expanded) {
            acc[triple.subject][triple.predicate] = expanded[triple.object];
            cb(err, acc);
          });
        }
      }, callback);
    });
  };

  graphdb.jsonld.get = function(iri, context, options, callback) {

    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    fetchExpandedTriples(iri, function(err, expanded) {
      if (err || expanded === null) {
        return callback(err, expanded);
      }
      expanded = Object.keys(expanded).reduce(function(acc, key) {
        acc.push(expanded[key]);
        return acc;
      }, []);

      jsonld.compact(expanded, context, options, callback);
    });
  };

  return graphdb;
}

module.exports = levelgraphJSONLD;
