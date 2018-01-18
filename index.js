var jsonld = require('jsonld'),
    uuid   = require('uuid'),
    RDFTYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    RDFFIRST = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
    RDFREST = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
    RDFNIL = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil',
    RDFLANGSTRING = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
    XSDTYPE = 'http://www.w3.org/2001/XMLSchema#',
    async = require('async'),
    N3Util = require('n3/lib/N3Util'); // with browserify require('n3').Util would bundle more then needed!

function levelgraphJSONLD(db, jsonldOpts) {

  if (db.jsonld) {
    return db;
  }

  var graphdb = Object.create(db);

  jsonldOpts = jsonldOpts || {};
  jsonldOpts.base = jsonldOpts.base || '';

  graphdb.jsonld = {
      options: jsonldOpts
  };

  function doPut(obj, options, callback) {
    // holds accumulated blank node identifiers
    // example {"_:b0": "_:...uuid..."}
    var blanks = {};
    // the inverse of the above object for speady look-up
    // example {"_:...uuid...": "_:b0"}
    var blanks_inverted = {};

    jsonld.expand(obj, function(err, expanded) {
      if (err) {
        return callback && callback(err);
      }
      if (options.base) {
        if (expanded['@context']) {
          expanded['@context']['@base'] = options.base;
        } else {
          expanded['@context'] = { '@base' : options.base };
        }
      }

      jsonld.toRDF(expanded, options, function(err, triples) {
        if (err || triples.length === 0) {
          return callback(err, null);
        }

        var stream = graphdb.putStream();

        stream.on('error', callback);
        stream.on('close', function() {
          if (options.blank_ids) {
            // return rdf store scoped blank nodes

            var blank_keys = Object.keys(blanks);

            function framify(o) {
              if (Array.isArray(o)) {
                return o.map(framify)
              } else if (typeof o == 'object') {
                var clone_o = {}
                Object.keys(o).forEach(function(key) {
                  if (Array.isArray(o[key]) && key != "@type") {
                    clone_o[key] = framify(o[key][0])
                  } else if (!Array.isArray(o[key]) && typeof o[key] === "object") {
                    clone_o[key] = framify(o[key])
                  } else {
                    clone_o[key] = framify(o[key])
                  }
                })
                return clone_o
              } else {
                return o
              }
            }

            var frame = framify(obj)

            if (blank_keys.length != 0) {
              jsonld.frame(obj, frame, function(err, framed) {
                if (err) {
                  return callback(err, null);
                }
                var framed_string = JSON.stringify(framed);

                blank_keys.forEach(function(blank) {
                  framed_string = framed_string.replace(blank,blanks[blank])
                })
                var ided = JSON.parse(framed_string);
                if (ided["@graph"].length == 1) {
                  var clean_reframe = Object.assign({}, { "@context": ided["@context"]}, ided["@graph"][0]);
                  return callback(null, clean_reframe);
                } else if (ided["@graph"].length > 1) {
                  return callback(null, ided);
                } else {
                  // Could not reframe the input, returning the original object
                  return callback(null, obj);
                }
              })
            } else {
              return callback(null, obj);
            }
          } else {
            return callback(null, obj);
          }
        });

        triples['@default'].map(function(triple) {

          return ['subject', 'predicate', 'object'].reduce(function(acc, key) {
            var node = triple[key];
            // generate UUID to identify blank nodes
            // uses type field set to 'blank node' by jsonld.js toRDF()
            if (node.type === 'blank node') {
              if (!(node.value in blanks)
                  // avoid adding newly generated blank node identifiers
                  && !(node.value in blanks_inverted)) {
                var bnode = '_:' + uuid.v1();
                blanks[node.value] = bnode;
                blanks_inverted[bnode] = node.value;
              }
              if (!(node.value in blanks_inverted)) {
                // we've not seen this one before, so add it to the node
                node.value = blanks[node.value];
              }
            }
            // preserve object data types using double quotation for literals
            // and don't keep data type for strings without defined language
            if(key === 'object' && triple.object.datatype){
              if(triple.object.datatype.match(XSDTYPE)){
                if(triple.object.datatype === 'http://www.w3.org/2001/XMLSchema#string'){
                  node.value = '"' + triple.object.value + '"';
                } else {
                  node.value = '"' + triple.object.value + '"^^' + triple.object.datatype;
                }
              } else if(triple.object.datatype.match(RDFLANGSTRING)){
                node.value = '"' + triple.object.value + '"@' + triple.object.language;
              } else {
                node.value = '"' + triple.object.value + '"^^' + triple.object.datatype;
              }
            }
            acc[key] = node.value;
            return acc;
          }, {});
        }).forEach(function(triple) {
          stream.write(triple);
        });
        stream.end();
      });

    });
  }

  function doDel(obj, options, callback) {
    var blanks = {};
    jsonld.expand(obj, options, function(err, expanded) {
      if (err) {
        return callback && callback(err);
      }

      var stream  = graphdb.delStream();
      stream.on('close', callback);
      stream.on('error', callback);

      if (options.base) {
        if (expanded['@context']) {
          expanded['@context']['@base'] = options.base;
        } else {
          expanded['@context'] = { '@base' : options.base };
        }
      }

      jsonld.toRDF(expanded, options, function(err, triples) {
        if (err || triples.length === 0) {
          return callback(err, null);
        }

        triples['@default'].map(function(triple) {

          return ['subject', 'predicate', 'object'].reduce(function(acc, key) {
            var node = triple[key];
            // mark blank nodes to skip deletion as per https://www.w3.org/TR/ldpatch/#Delete-statement
            // uses type field set to 'blank node' by jsonld.js toRDF()
            if (node.type === 'blank node') {
              if (!blanks[node.value]) {
                blanks[node.value] = '_:';
              }
              node.value = blanks[node.value];
            }
            // preserve object data types using double quotation for literals
            // and don't keep data type for strings without defined language
            if(key === 'object' && triple.object.datatype){
              if(triple.object.datatype.match(XSDTYPE)){
                if(triple.object.datatype === 'http://www.w3.org/2001/XMLSchema#string'){
                  node.value = '"' + triple.object.value + '"';
                } else {
                  node.value = '"' + triple.object.value + '"^^' + triple.object.datatype;
                }
              } else if(triple.object.datatype.match(RDFLANGSTRING)){
                node.value = '"' + triple.object.value + '"@' + triple.object.language;
              } else {
                node.value = '"' + triple.object.value + '"^^' + triple.object.datatype;
              }
            }
            acc[key] = node.value;
            return acc;
          }, {});
        }).forEach(function(triple) {
          // Skip marked blank nodes.
          if (triple.subject.indexOf('_:') !== 0 && triple.object.indexOf('_:') !== 0) {
            stream.write(triple);
          }
        });
        stream.end();
      });
    })
  }

  function doCut(obj, options, callback) {
    var iri = obj;
    if (typeof obj !=='string') {
      iri = obj['@id'];
    }
    if (iri === undefined) {
      return callback && callback(null);
    }

    var stream = graphdb.delStream();
    stream.on('close', callback);
    stream.on('error', callback);

    (function delAllTriples(iri, done) {
      graphdb.get({ subject: iri }, function(err, triples) {
        async.each(triples, function(triple, cb) {
          stream.write(triple);
          if (triple.object.indexOf('_:') === 0 || (options.recurse && N3Util.isIRI(triple.object))) {
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
  }

  graphdb.jsonld.put = function(obj, options, callback) {

    if (typeof obj === 'string') {
      obj = JSON.parse(obj);
    }

    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    options.base = options.base || this.options.base;
    options.overwrite = options.overwrite !== undefined ? options.overwrite : ( this.options.overwrite !== undefined ? this.options.overwrite : false );

    if (!options.overwrite) {
      doPut(obj, options, callback);
    } else {
      graphdb.jsonld.del(obj, options, function(err) {
        if (err) {
          return callback && callback(err);
        }
      });
      doPut(obj, options, callback);
    }
  };

  graphdb.jsonld.del = function(obj, options, callback) {

    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    options.cut = options.cut !== undefined ? options.cut : ( this.options.cut !== undefined ? this.options.cut : false );
    options.recurse = options.recurse !== undefined ? options.recurse : ( this.options.recurse !== undefined ? this.options.recurse : false );

    if (typeof obj === 'string') {
      try {
        obj = JSON.parse(obj);
      } catch (e) {
        if (N3Util.isIRI(obj) && !options.cut) {
          callback(new Error("Passing an IRI to del is not supported anymore. Please pass a JSON-LD document."))
        }
      }
    }

    if (!options.cut) {
      doDel(obj, options, callback)
    } else {
      doCut(obj, options, callback)
    }
  };


  graphdb.jsonld.cut = function(obj, options, callback) {

    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    options.recurse = options.recurse ||  this.options.recurse || false;

    doCut(obj, options, callback);
  }

  // http://json-ld.org/spec/latest/json-ld-api/#data-round-tripping
  function getCoercedObject(object) {
    var TYPES = {
      PLAIN: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#PlainLiteral',
      BOOLEAN: XSDTYPE + 'boolean',
      INTEGER: XSDTYPE + 'integer',
      DOUBLE: XSDTYPE + 'double',
      STRING: XSDTYPE + 'string',
    };
    var value = N3Util.getLiteralValue(object);
    var type = N3Util.getLiteralType(object);
    var coerced = {};
    switch (type) {
      case TYPES.STRING:
      case TYPES.PLAIN:
        coerced['@value'] = value;
        break;
      case RDFLANGSTRING:
        coerced['@value'] = value;
        coerced['@language'] = N3Util.getLiteralLanguage(object);
        break;
      case TYPES.INTEGER:
        coerced['@value'] = parseInt(value, 10);
        break;
      case TYPES.DOUBLE:
        coerced['@value'] = parseFloat(value);
        break;
      case TYPES.BOOLEAN:
        if (value === 'true' || value === '1') {
          coerced['@value'] = true;
        } else if (value === 'false' || value === '0') {
          coerced['@value'] = false;
        } else {
          throw new Error('value not boolean!');
        }
        break;
      default:
        coerced = { '@value': value, '@type': type };
    }
    return coerced;
  }

  function fetchExpandedTriples(iri, memo, callback) {
    if (typeof memo === 'function') {
      callback = memo;
      memo = {};
    }

    graphdb.get({ subject: iri }, function(err, triples) {
      if (err || triples.length === 0) {
        return callback(err, null);
      }

      async.reduce(triples, memo, function(acc, triple, cb) {
        var key;

        if (!acc[triple.subject] && !N3Util.isBlank(triple.subject)) {
          acc[triple.subject] = { '@id': triple.subject };
        } else if (N3Util.isBlank(triple.subject) && !acc[triple.subject]) {
          acc[triple.subject] = {};
        }
        if (triple.predicate === RDFTYPE) {
          if (acc[triple.subject]['@type']) {
            acc[triple.subject]['@type'].push(triple.object);
          } else {
            acc[triple.subject]['@type'] = [triple.object];
          }
          return cb(null, acc);
        } else if (!N3Util.isBlank(triple.object)) {
          var object = {};
          if (N3Util.isIRI(triple.object)) {
            object['@id'] = triple.object;
          } else if (N3Util.isLiteral(triple.object)) {
            object = getCoercedObject(triple.object);
          }
          if(object['@id']) {
            // expanding object iri
            fetchExpandedTriples(triple.object, function(err, expanded) {
              if (!acc[triple.subject][triple.predicate]) acc[triple.subject][triple.predicate] = [];
              if (expanded !== null) {
                acc[triple.subject][triple.predicate].push(expanded[triple.object]);
              } else {
                acc[triple.subject][triple.predicate].push(object);
              }
              return cb(err, acc);
            });
          }
          else if (Array.isArray(acc[triple.subject][triple.predicate])){
            acc[triple.subject][triple.predicate] = acc[triple.subject][triple.predicate].concat(object);
            return cb(err, acc);
          } else {
            acc[triple.subject][triple.predicate] = Array.isArray(object) ? object : [object];
            return cb(err, acc);
          }
        } else {
          // deal with blanks
          fetchExpandedTriples(triple.object, function(err, expanded) {
            if (!acc[triple.subject][triple.predicate]) acc[triple.subject][triple.predicate] = [];
            if (expanded !== null) {
              acc[triple.subject][triple.predicate] = acc[triple.subject][triple.predicate].concat(expanded[triple.object]);
            } else {
              acc[triple.subject][triple.predicate] = acc[triple.subject][triple.predicate].concat(object);
            }
            return cb(err, acc);
          });
        }
      }, function (err, nodes) {
        if (err) return callback(err)

        if (nodes[iri][RDFFIRST]) {

          var list = { '@list': gatherList(nodes[iri]) }
          nodes[iri] = list
        }

        callback(null, nodes)
      })

      function gatherList(node) {
        var list = []
        list = list.concat(node[RDFFIRST])
        if (node[RDFREST]) {
          if (node[RDFREST][0] && node[RDFREST][0]['@list']) {
            list = list.concat(node[RDFREST][0]['@list'])
          } else if (!(node[RDFREST][0] && node[RDFREST][0]['@id'] && node[RDFREST][0]['@id'] == RDFNIL)) {
            list = list.concat(node[RDFREST])
          }
        }
        return list
      }
    });
  }

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
