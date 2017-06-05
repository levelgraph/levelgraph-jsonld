LevelGraph-JSONLD
===========

![Logo](https://github.com/levelgraph/node-levelgraph/raw/master/logo.png)

[![Build Status](https://travis-ci.org/levelgraph/levelgraph-jsonld.png)](https://travis-ci.org/levelgraph/levelgraph-jsonld)
[![Coverage Status](https://coveralls.io/repos/levelgraph/levelgraph-jsonld/badge.png)](https://coveralls.io/r/levelgraph/levelgraph-jsonld)
[![Dependency Status](https://david-dm.org/levelgraph/levelgraph-jsonld.png?theme=shields.io)](https://david-dm.org/levelgraph/levelgraph-jsonld)
[![Sauce Labs Tests](https://saucelabs.com/browser-matrix/levelgraph-jsonld.svg)](https://saucelabs.com/u/levelgraph-jsonld)

__LevelGraph-JSONLD__ is a plugin for
[LevelGraph](http://github.com/levelgraph/levelgraph) that adds the
ability to store, retrieve and delete JSON-LD objects.
In fact, it is a full-blown Object-Document-Mapper (ODM) for
__LevelGraph__.

## Install

### Node.js

Adding support for JSON-LD to LevelGraph is easy:
```shell
$ npm install level levelgraph levelgraph-jsonld --save
```
Then in your code:
```javascript
var levelup = require("levelup"),
    yourDB = levelup("./yourdb"),
    levelgraph = require('levelgraph'),
    levelgraphJSONLD = require('levelgraph-jsonld'),
    db = levelgraphJSONLD(levelgraph(yourDB));
```

At the moment it requires node v0.10.x, but the port to node v0.8.x
should be straighforward.
If you need it, just open a pull request.

## Browser

If you use [browserify](http://browserify.org/) you can use this package
in a browser just as in node.js. Please also take a look at [Browserify
section in LevelGraph package](https://github.com/levelgraph/levelgraph#browserify)

You can also use standalone browserified version from `./build`
directory or use [bower](http://bower.io)

```shell
$ bower install levelgraph-jsonld --save
```
It will also install its dependency levelgraph! Now you can simply:

```html
<script src="bower_components/levelgraph/build/levelgraph.js"></script>
<script src="bower_components/levelgraph-jsonld/build/levelgraph-jsonld.js"></script>
<script>
  var db = levelgraphJSONLD(levelgraph('yourdb'));
</script>
```

## Usage

We assume in following examples that you created database as explained
above!
```js
var levelup = require("levelup"),
    yourDB = levelup("./yourdb"),
    db = levelgraphJSONLD(levelgraph(yourDB));
```

`'base'` can also be specified when you create the db:
```javascript
var levelup    = require("levelup"),
    yourDB     = levelup("./yourdb"),
    levelgraph = require('levelgraph'),
    jsonld     = require('levelgraph-jsonld'),
    opts       = { base: 'http://matteocollina.com/base' },
    db         = jsonld(levelgraph(yourDB), opts);
```

> From v1, overwriting and deleting is more conservative. If you rely on the previous behavior you can set the `overwrite` option to `true` (when creating the db or as options to `put` and `del`) to:
>  - overwrite all existing triples when using `put`
>  - delete all blank nodes recursively when using `del` (cf upcoming `cut` function)
> This old api will be phased out.

### Put

Please keep in mind that LevelGraph-JSONLD __doesn't store the original
JSON-LD document but decomposes it into triples__! It stores literals
double quoted with datatype if other then string. If you use plain
LevelGraph methods, instead trying to match number `42` you need to try
matching `"42"^^http://www.w3.org/2001/XMLSchema#integer`

 Storing triples from JSON-LD document is extremely easy:
```javascript
var manu = {
  "@context": {
    "name": "http://xmlns.com/foaf/0.1/name",
    "homepage": {
      "@id": "http://xmlns.com/foaf/0.1/homepage",
      "@type": "@id"
    }
  },
  "@id": "http://manu.sporny.org#person",
  "name": "Manu Sporny",
  "homepage": "http://manu.sporny.org/"
};

db.jsonld.put(manu, function(err, obj) {
  // do something after the obj is inserted
});
```

if the top level objects have no `'@id'` key, one will be generated for
each, using a UUID and the `'base'` argument, like so:
```javascript
delete manu['@id'];
db.jsonld.put(manu, { base: 'http://this/is/an/iri' }, function(err, obj) {
  // obj['@id'] will be something like
  // http://this/is/an/iri/b1e783b0-eda6-11e2-9540-d7575689f4bc
});
```

`'base'` can also be [specified when you create the db](#usage).

__LevelGraph-JSONLD__ also support nested objects, like so:
```javascript
var nested = {
  "@context": {
    "name": "http://xmlns.com/foaf/0.1/name",
    "knows": "http://xmlns.com/foaf/0.1/knows"
  },
  "@id": "http://matteocollina.com",
  "name": "Matteo",
  "knows": [{
    "name": "Daniele"
  }, {
    "name": "Lucio"
  }]
};

db.jsonld.put(nested, function(err, obj) {
  // do something...
});
```

### Get

Retrieving a JSON-LD object from the store requires its `'@id'`:
```javascript
db.jsonld.get(manu['@id'], { '@context': manu['@context'] }, function(err, obj) {
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
    "name": "http://xmlns.com/foaf/0.1/name",
    "knows": "http://xmlns.com/foaf/0.1/knows"
  },
  "@id": "http://matteocollina.com",
  "name": "Matteo",
  "knows": [{
    "name": "Daniele"
  }, {
    "name": "Lucio"
  }]
};

db.jsonld.put(nested, function(err, obj) {
  // obj will be
  // {
  //   "@context": {
  //     "name": "http://xmlns.com/foaf/0.1/name",
  //     "knows": "http://xmlns.com/foaf/0.1/knows"
  //   },
  //   "@id": "http://matteocollina.com",
  //   "name": "Matteo",
  //   "knows": [{
  //     "@id": "_:7053c150-5fea-11e3-a62e-adadc4e3df79",
  //     "name": "Daniele"
  //   }, {
  //     "@id": "_:9d2bb59d-3baf-42ff-ba5d-9f8eab34ada5",
  //     "name": "Lucio"
  //   }]
  // }
});
```

### Delete

In order to delete an object, you need to pass the document to the `'del'` method which will delete only the properties specified in the document:
```javascript
db.jsonld.del(manu, function(err) {
  // do something after it is deleted!
});
```

Note that blank nodes are ignored, so to delete blank nodes you need to pass the `cut: true` option (you can also add the `recurse: true`option) or use the `'cut'` method below.

> Note that since v1 `'del'` doesn't support passing an IRI anymore.

### Cut

In order to delete the blank nodes object, you can just pass it's `'@id'` to the
`'cut'` method:
```javascript
db.jsonld.cut(manu['@id'], function(err) {
  // do something after it is cut!
});
```

You can also pass an object, but in this case the properties are not used to determine which triples will be deleted and only the `@id`s are considered.

Using the `recurse` option you can follow all links and blank nodes (which might result in deleting more data than you expect)
```javascript
db.jsonld.cut(manu['@id'], { recurse: true }, function(err) {
  // do something after it is cut!
});
```

### Searching with LevelGraph

__LevelGraph-JSONLD__ does not support searching for objects, because
that problem is already solved by __LevelGraph__ itself. This example
search finds friends living near Paris:
```javascript
var manu = {
  "@context": {
    "@vocab": "http://xmlns.com/foaf/0.1/",
    "homepage": { "@type": "@id" },
    "knows": { "@type": "@id" },
    "based_near": { "@type": "@id" }
  },
  "@id": "http://manu.sporny.org#person",
  "name": "Manu Sporny",
  "homepage": "http://manu.sporny.org/",
  "knows": [{
    "@id": "https://my-profile.eu/people/deiu/card#me",
    "name": "Andrei Vlad Sambra",
    "based_near": "http://dbpedia.org/resource/Paris"
  }, {
    "@id": "http://melvincarvalho.com/#me",
    "name": "Melvin Carvalho",
    "based_near": "http://dbpedia.org/resource/Honolulu"
  }, {
    "@id": "http://bblfish.net/people/henry/card#me",
    "name": "Henry Story",
    "based_near": "http://dbpedia.org/resource/Paris"
  }, {
    "@id": "http://presbrey.mit.edu/foaf#presbrey",
    "name": "Joe Presbrey",
    "based_near": "http://dbpedia.org/resource/Cambridge"
  }]
};

var paris = 'http://dbpedia.org/resource/Paris';

db.jsonld.put(manu, function(){
  db.search([{
    subject: manu['@id'],
    predicate: 'http://xmlns.com/foaf/0.1/knows',
    object: db.v('webid')
  }, {
    subject: db.v('webid'),
    predicate: 'http://xmlns.com/foaf/0.1/based_near',
    object: paris
  }, {
    subject: db.v('webid'),
    predicate: 'http://xmlns.com/foaf/0.1/name',
    object: db.v('name')
  }
  ], function(err, solution) {
    // solution contains
    // [{
    //   webid: 'http://bblfish.net/people/henry/card#me',
    //   name: '"Henry Story"'
    // }, {
    //   webid: 'https://my-profile.eu/people/deiu/card#me',
    //   name: '"Andrei Vlad Sambra"'
    // }]
  });
});
```
## Changes

[CHANGELOG.md](https://github.com/levelgraph/levelgraph-jsonld/blob/master/CHANGELOG.md)
**including migration info for breaking changes**


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

Copyright (c) 2013-2017 Matteo Collina and LevelGraph-JSONLD contributors

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
