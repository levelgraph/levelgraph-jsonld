LevelGraph-JSONLD
===========

![Logo](https://github.com/mcollina/node-levelgraph/raw/master/logo.png)

__LevelGraph-JSONLD__ is a plugin for
[LevelGraph](http://github.com/mcollina/levelgraph) that adds the
ability to store, retrieve and delete JSON-LD objects.
In fact, it is a full-bown Object-Document-Mapper (ODM) for
__LevelGraph__.

[![Build
Status](https://travis-ci.org/mcollina/levelgraph-jsonld.png)](https://travis-ci.org/mcollina/levelgraph-jsonld)

## Install on Node.js

```shell
$ npm install levelgraph levelgraph-jsonld --save
```

At the moment it requires node v0.10.x, but the port to node v0.8.x
should be straighforward.
If you need it, just open a pull request.

## Install in the Browser

WORK IN PROGRESS! [#3](http://github.com/mcollina/levelgraph-jsonld/issues/3)

## Usage

Adding support for JSON-LD to LevelGraph is easy:
```javascript
var levelgraph = require("levelgraph")
  , jsonld     = require("levelgraph-jsonld")
  , db         = jsonld(levelgraph("yourdb"));
```

### Put

Please keep in mind that LevelGraph-JSONLD __doesn't store the original
JSON-LD document but decomposes it into triples__! Storing triples from JSON-LD document is extremely easy:
```javascript
var manu = {
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

db.jsonld.put(manu, function(err, obj) {
  // do something after the obj is inserted
});
```

if the top level objects have no `'@id'` key, one will be generated for
each, using a UUID and the `'base'` argument, like so:
```javascript
delete manu["@id"];
db.jsonld.put(manu, { base: "http://this/is/an/iri" }, function(err, obj) {
  // obj["@id"] will be something like
  // http://this/is/an/iri/b1e783b0-eda6-11e2-9540-d7575689f4bc
});
```

`'base'` can also be specified when you create the db:
```javascript
var levelgraph = require("levelgraph")
  , jsonld     = require("levelgraph-jsonld")
  , opts       = { base: "http://matteocollina.com/base" }
  , db         = jsonld(levelgraph("yourdb"), opts);
```

__LevelGraph-JSONLD__ also support nested objects, like so:
```javascript
var nested = {
    "@context": {
        "name": "http://xmlns.com/foaf/0.1/name"
      , "knows": "http://xmlns.com/foaf/0.1/knows"
    }
  , "@id": "http://matteocollina.com"
  , "name": "matteo"
  , "knows": [{
        "name": "daniele"
    }, {
        "name": "lucio"
    }]
};

db.jsonld.put(nested, function(err, obj) {
  // do something...
});
```

### Get

Retrieving a JSON-LD object from the store requires its `'@id'`:
```javascript
db.jsonld.get(manu["@id"], { "@context": manu["@context"] }, function(err, obj) {
  // obj will be the very same of the manu object
});
```

The format of the loaded object is entirely specified by the
`'@context'`, so have fun :).

As with `'put'` it correctly support nested objects. If nested objects didn't originally include `'@id'` properties, now they will have them since `'put'` generates them by using UUID and formats
them as *blank node identifiers*:
```javascript
var nested = {
    "@context": {
        "name": "http://xmlns.com/foaf/0.1/name"
      , "knows": "http://xmlns.com/foaf/0.1/knows"
    }
  , "@id": "http://matteocollina.com"
  , "name": "matteo"
  , "knows": [{
        "name": "daniele"
    }, {
        "name": "lucio"
    }]
};

db.jsonld.put(nested, function(err, obj) {
  // obj will be 
  // {
  //     "@context": {
  //         "name": "http://xmlns.com/foaf/0.1/name"
  //       , "knows": "http://xmlns.com/foaf/0.1/knows"
  //     }
  //   , "@id": "http://matteocollina.com"
  //   , "name": "matteo"
  //   , "knows": [{
  //         "@id": "_:7053c150-5fea-11e3-a62e-adadc4e3df79"
  //       , "name": "daniele"
  //     }, {
  //         "@id": "_:9d2bb59d-3baf-42ff-ba5d-9f8eab34ada5"
  //         "name": "lucio"
  //     }]
  // }
});
```

### Delete

In order to delete an object, you can just pass it's `'@id'` to the
`'@del'` method:
```javascript
db.jsonld.del(manu["@id"], function(err) {
  // do something after it is deleted!
});
```

### Searching with LevelGraph

__LevelGraph-JSONLD__ does not support searching for objects, because
that problem is already solved by __LevelGraph__ itself, like these:
```javascript
var nested = {
    "@context": {
        "name": "http://xmlns.com/foaf/0.1/name"
      , "knows": "http://xmlns.com/foaf/0.1/knows"
    }
  , "@id": "http://matteocollina.com"
  , "name": "matteo"
  , "knows": [{
        "name": "daniele"
    }, {
        "name": "lucio"
    }]
};

db.jsonld.put(nested, function(err) {
  db.join([{
      subject: db.v("person")
    , predicate: "http://xmlns.com/foaf/0.1/knows"
    , object: db.v("friend")
  }, {
      subject: db.v("friend")
    , predicate: "http://xmlns.com/foaf/0.1/knows"
    , object: "daniele"
  }], function(err, solutions) {
    // The solutions will be:
    // 1. { person: "http://matteocollina.com", friend: "_:abcde" }
    // 1. { person: "http://matteocollina.com", friend: "_:efghi" }
  });
});
```

## Contributing to LevelGraph-JSONLD

* Check out the latest master to make sure the feature hasn't been
  implemented or the bug hasn't been fixed yet
* Check out the issue tracker to make sure someone already hasn't
  requested it and/or contributed it
* Fork the project
* Start a feature/bugfix branch
* Commit and push until you are happy with your contribution
* Make sure to add tests for it. This is important so I don't break it
  in a future version unintentionally.
* Please try not to mess with the Makefile and package.json. If you
  want to have your own version, or is otherwise necessary, that is
  fine, but please isolate to its own commit so I can cherry-pick around
  it.

## LICENSE - "MIT License"

Copyright (c) 2013 Matteo Collina (http://matteocollina.com)

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
