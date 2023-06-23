var expect = require('chai').expect;
var helper = require('./helper');

describe('jsonld.del', function() {

  var db, manu, tesla;

  beforeEach(function() {
    db = helper.getDB({ jsonld: { base: 'http://levelgraph.io/' } });
    manu = helper.getFixture('manu.json');
    tesla = helper.getFixture('tesla.json');
  });

  afterEach(function(done) {
    db.close(done);
  });

  it('should accept a done callback', function(done) {
    db.jsonld.put(manu, done);
  });

  it('should del a basic object', function(done) {
    db.jsonld.put(manu, function() {
      db.jsonld.del(manu, function() {
        db.get({}, function(err, triples) {
          // getting the full db
          expect(triples).to.be.empty;
          done();
        });
      });
    });
  });


  it('should del nothing', function(done) {
    db.jsonld.put(manu, function() {
      db.jsonld.del({}, function() {
        db.get({}, function(err, triples) {
          // getting the full db
          expect(triples).to.have.length(2);
          done();
        });
      });
    });
  });

  it('should del a complex object', function(done) {
    db.jsonld.put(tesla, function() {
      db.jsonld.del(tesla, function() {
        db.get({}, function(err, triples) {
          // getting the full db
          expect(triples).to.have.length(8);
          done();
        });
      });
    });
  });

  it('should del a complex object including blank nodes with the cut option set to true', function(done) {
    db.jsonld.put(tesla, function(err) {
      db.jsonld.del(tesla, { cut: true }, function() {
        db.get({}, function(err, triples) {
          // blank nodes are left. Consistent with https://www.w3.org/TR/ldpatch/#Delete-statement
          expect(triples).to.have.length(0);
          done();
        });
      });
    });
  });

  it('should error when iri is passed', function(done) {
    db.jsonld.put(manu, function() {
      db.jsonld.del(manu['@id'], function(err) {
        expect(err && err.message).to.equal("Passing an IRI to del is not supported anymore. Please pass a JSON-LD document.")
        done();
      });
    });
  });

  it('should del an iri with the cut option', function(done) {
    db.jsonld.put(manu, function() {
      db.jsonld.del(manu['@id'], { cut: true }, function(err) {
        db.get({}, function(err, triples) {
          // getting the full db
          expect(triples).to.have.length(0);
          done();
        });
      });
    });
  });


  it('should del a single object leaving blank nodes', function(done) {
    db.jsonld.put(manu, function() {
      db.jsonld.put(tesla, function() {
        db.jsonld.del(tesla, function() {
          db.get({}, function(err, triples) {
            // getting the full db
            expect(triples).to.have.length(10); // 2 triples from Manu and 8 from tesla blanks.
            done();
          });
        });
      });
    });
  });

  it('should del a single object with the cut option leaving blank nodes', function(done) {
    // This should also be deprecated in favor of using a `cut` option or the `cut` function.
    db.jsonld.put(manu, function() {
      db.jsonld.put(tesla, function() {
        db.jsonld.del(tesla, {cut: true}, function() {
          db.get({}, function(err, triples) {
            // getting the full db
            expect(triples).to.have.length(2); // 2 triples from Manu.
            done();
          });
        });
      });
    });
  });

  it('should del a single object with no blank nodes completely', function(done) {
    var library = helper.getFixture('library_framed.json');

    db.jsonld.put(manu, function() {
      db.jsonld.put(library, function() {
        db.jsonld.del(library, function() {
          db.get({}, function(err, triples) {
            // getting the full db
            expect(triples).to.have.length(2);
            done();
          });
        });
      });
    });
  });

  it('should del obj passed as stringified JSON', function(done) {
    var jld = {"@context": { "@vocab": "https://schema.org/"}, "name": "BigBlueHat"};

    db.jsonld.put(JSON.stringify(jld), function() {
      db.jsonld.del(JSON.stringify(jld), function(err) {
        expect(err).to.not.exist;
        db.get({}, function(err, triples) {
          // getting the full db
          expect(triples).to.have.length(1);
          done();
        });
      });
    });
  });
});

describe('jsonld.del with overwrite and cut set to true (backward compatibility)', function() {

  var db, manu, tesla;

  beforeEach(function() {
    db = helper.getDB({ jsonld: { base: 'http://levelgraph.io/', overwrite: true, cut: true } });
    manu = helper.getFixture('manu.json');
    tesla = helper.getFixture('tesla.json');
  });

  afterEach(function(done) {
    db.close(done);
  });

  it('should accept a done callback', function(done) {
    db.jsonld.put(manu, done);
  });

  it('should del a basic object', function(done) {
    db.jsonld.put(manu, function() {
      db.jsonld.del(manu, function() {
        db.get({}, function(err, triples) {
          // getting the full db
          expect(triples).to.be.empty;
          done();
        });
      });
    });
  });

  it('should del nothing', function(done) {
    db.jsonld.put(manu, function() {
      db.jsonld.del({}, function() {
        db.get({}, function(err, triples) {
          // getting the full db
          expect(triples).to.have.length(2);
          done();
        });
      });
    });
  });

  it('should del nothing with a top blank node', function(done) {
    delete manu["@id"];
    db.jsonld.put(manu, function() {
      db.jsonld.del({}, function() {
        db.get({}, function(err, triples) {
          // getting the full db
          expect(triples).to.have.length(2);
          done();
        });
      });
    });
  });

  it('should del nothing with the recurse option set and a top blank node', function(done) {
    delete manu["@id"];
    db.jsonld.put(manu, function() {
      db.jsonld.del({}, { recurse: true }, function() {
        db.get({}, function(err, triples) {
          // getting the full db
          expect(triples).to.have.length(2);
          done();
        });
      });
    });
  });

  it('should del a complex object', function(done) {
    db.jsonld.put(tesla, function() {
      db.jsonld.del(tesla, function() {
        db.get({}, function(err, triples) {
          // getting the full db
          expect(triples).to.be.empty;
          done();
        });
      });
    });
  });

  it('should del a complex object cutting blank nodes', function(done) {
    db.jsonld.put(tesla, function() {
      db.jsonld.del(tesla, function() {
        db.get({}, function(err, triples) {
          // blank nodes are cut.
          expect(triples).to.have.length(0);
          done();
        });
      });
    });
  });

  it('should del a complex object with no blank nodes without recursing', function(done) {
    var library = helper.getFixture('library_framed.json');

    db.jsonld.put(library, function() {
      db.jsonld.del(library, function() {
        db.get({}, function(err, triples) {
          // blank nodes are left. Consistent with https://www.w3.org/TR/ldpatch/#Delete-statement
          expect(triples).to.have.length(7);
          done();
        });
      });
    });
  });

  it('should del a complex object with no blank nodes with the recurse option completely', function(done) {
    var library = helper.getFixture('library_framed.json');

    db.jsonld.put(library, function() {
      db.jsonld.del(library, {recurse: true}, function() {
        db.get({}, function(err, triples) {
          // blank nodes are left. Consistent with https://www.w3.org/TR/ldpatch/#Delete-statement
          expect(triples).to.have.length(0);
          done();
        });
      });
    });
  });

  it('should del an iri', function(done) {
    db.jsonld.put(manu, function() {
      db.jsonld.del(manu['@id'], function() {
        db.get({}, function(err, triples) {
          // getting the full db
          expect(triples).to.be.empty;
          done();
        });
      });
    });
  });

  it('should del a single object leaving blank nodes', function(done) {
    db.jsonld.put(manu, function() {
      db.jsonld.put(tesla, function() {
        db.jsonld.del(tesla, function() {
          db.get({}, function(err, triples) {
            // getting the full db
            expect(triples).to.have.length(2);
            done();
          });
        });
      });
    });
  });

  it('should del a single object with cut set to false leaving blank nodes', function(done) {
    db.jsonld.put(manu, function() {
      db.jsonld.put(tesla, function() {
        db.jsonld.del(tesla, { cut: false }, function() {
          db.get({}, function(err, triples) {
            // getting the full db
            expect(triples).to.have.length(10); // 2 triples from Manu and 8 from tesla blanks.
            done();
          });
        });
      });
    });
  });

  it('should del a single object with no blank nodes completely with the recurse option', function(done) {
    var library = helper.getFixture('library_framed.json');

    db.jsonld.put(manu, function(err) {
      db.jsonld.put(library, function(err) {
        db.jsonld.del(library, {recurse:true}, function(err) {
          db.get({}, function(err, triples) {
            // getting the full db
            expect(triples).to.have.length(2);
            done();
          });
        });
      });
    });
  });

  it('should del obj passed as stringified JSON', function(done) {
    var jld = {"@context": { "@vocab": "https://schema.org/"}, "name": "BigBlueHat"};

    db.jsonld.put(JSON.stringify(jld), {preserve:true}, function() {
      db.jsonld.del(JSON.stringify(jld), {preserve:true}, function(err) {
        expect(err).to.not.exist;
        db.get({}, function(err, triples) {
          // getting the full db
          expect(triples).to.have.length(1);
          done();
        });
      });
    });
  });

});
