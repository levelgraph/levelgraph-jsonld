
var jsonld = require("jsonld")
  , uuid   = require("uuid")
  , IRI = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/i
  , RDFTYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
  , XSDTYPE = "http://www.w3.org/2001/XMLSchema#"
  , async = require("async")
  , blanksRegexp = /^_:b\d+$/
  , genActionStream;

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

  var doPut = function(obj, options, callback) {
    var blanks = {};

    jsonld.toRDF(obj, options, function(err, triples) {

      var stream = graphdb.putStream();

      stream.on("error", callback);
      stream.on("close", function() {
        callback(null, obj);
      });

      triples["@default"].map(function(triple) {
        return ["subject", "predicate", "object"].reduce(function(acc, key) {
          var value = triple[key].value;
          if (value.match(blanksRegexp)) {
            if (!blanks[value]) {
              blanks[value] = "_:" + uuid.v1();
            }
            value = blanks[value];
          }
          // preserve object data type if other then string
          if(key === "object" && triple.object.datatype &&  triple.object.datatype.match(XSDTYPE)){
            if(triple.object.datatype !== "http://www.w3.org/2001/XMLSchema#string"){
              value = '"' + triple.object.value + '"^^<' + triple.object.datatype + '>';
            }
          }
          acc[key] = value;
          return acc;
        }, {});
      }).forEach(function(triple) {
        stream.write(triple);
      });

      stream.end();
    });
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

    if (obj["@id"]) {
      graphdb.jsonld.del(obj["@id"], options, function(err) {
        if (err) {
          return callback && callback(err);
        }
        doPut(obj, options, callback);
      });
    } else {
      obj["@id"] = options.base + uuid.v1();
      doPut(obj, options, callback);
    }
  };

  graphdb.jsonld.del = function(iri, options, callback) {
    if (typeof options === "function") {
      callback = options;
      options = {};
    }

    if (typeof iri !=='string') {
      iri = iri["@id"];
    }

    var stream  = graphdb.delStream();
    stream.on("close", callback);
    stream.on("error", callback);

    (function delAllTriples(iri, done) {
      graphdb.get({ subject: iri }, function(err, triples) {
        async.each(triples, function(triple, cb) {
          stream.write(triple);
          if (triple.object.indexOf("_:") === 0) {
            delAllTriples(triple.object, cb);
          } else {
            cb();
          }
        }, done);
      });
    })(iri, function(err) {
      if (err) {
        return callback(err);
      }
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
          key = (triple.object.match(IRI)) ? "@id" : "@value";
          // coerce
          var coercionCheck = triple.object.match(/"(.*)"\^\^<http:\/\/www.w3.org\/2001\/XMLSchema#(.*)>/);
          if (coercionCheck) {
            switch (coercionCheck[2]) {
              case "boolean":
                if (coercionCheck[1] === "true") {
                  triple.object = true;
                }
                if (coercionCheck[1] === "false") {
                  triple.object = false;
                }
                break;
              case "integer":
                triple.object = parseInt(coercionCheck[1], 10);
                break;
              case "double":
                triple.object = parseFloat(coercionCheck[1]);
                break;
              case "string":
                triple.object = coercionCheck[1];
                break;
            }
          }
          acc[triple.subject][triple.predicate][key] = triple.object;
          cb(null, acc);
        } else {
          fetchExpandedTriples(triple.object, function(err, expanded) {
            if (!acc[triple.subject][triple.predicate]) {
              acc[triple.subject][triple.predicate] = expanded[triple.object];
            } else {
              if (!acc[triple.subject][triple.predicate].push) {
                acc[triple.subject][triple.predicate] = [acc[triple.subject][triple.predicate]];
              }
              acc[triple.subject][triple.predicate].push(expanded[triple.object]);
            }
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

      jsonld.compact(expanded[iri], context, options, callback);
    });
  };

  return graphdb;
}

module.exports = levelgraphJSONLD;

genActionStream = function(graphdb, type) {
  return 
};
